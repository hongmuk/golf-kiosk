import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import { useOrderStore } from '../stores/orderStore';
import { useIpc } from '../hooks/useIpc';

type PayPhase = 'waiting' | 'processing' | 'success' | 'failed';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<PayPhase>('waiting');
  const [retryCount, setRetryCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const { amount, productType, designDataJson, setOrder } = useOrderStore();
  const api = useIpc();

  const processPayment = async () => {
    setPhase('processing');
    const result = await api.requestPayment(amount);

    if (result.success) {
      setPhase('success');
      const dbResult = await api.dbExecute(
        `INSERT INTO orders (product_type, design_data, amount, payment_status, kicc_transaction_id, kicc_approval_no)
         VALUES (?, ?, ?, 'completed', ?, ?)`,
        [productType, designDataJson, amount, result.transactionId, result.approvalNo]
      );
      setOrder({
        orderId: dbResult.lastInsertRowid,
        transactionId: result.transactionId || '',
        approvalNo: result.approvalNo || '',
      });
      setTimeout(() => navigate('/printing'), 1500);
    } else {
      setPhase('failed');
      setErrorMsg(result.error || '결제에 실패했습니다.');
      setRetryCount((c) => c + 1);
    }
  };

  useEffect(() => {
    const timer = setTimeout(processPayment, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'waiting' && phase !== 'processing') return;
    const timeout = setTimeout(() => {
      if (phase === 'waiting' || phase === 'processing') {
        setPhase('failed');
        setErrorMsg('결제 시간이 초과되었습니다.');
      }
    }, 60000);
    return () => clearTimeout(timeout);
  }, [phase]);

  const handleRetry = () => {
    if (retryCount >= 3) { navigate('/'); return; }
    setPhase('waiting');
    setTimeout(processPayment, 500);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="결제" showBack={phase === 'waiting' || phase === 'failed'} />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', gap: 30,
      }}>
        <div style={{ fontSize: 36, fontWeight: 'bold', color: '#ffd700' }}>
          {amount.toLocaleString()}원
        </div>

        {phase === 'waiting' && <>
          <div style={{ fontSize: 80 }}>💳</div>
          <div style={{ fontSize: 28 }}>카드를 결제기에 투입해주세요</div>
        </>}

        {phase === 'processing' && <>
          <div style={{ fontSize: 80, animation: 'pulse 1s infinite' }}>⏳</div>
          <div style={{ fontSize: 28 }}>결제 처리 중...</div>
        </>}

        {phase === 'success' && <>
          <div style={{ fontSize: 80 }}>✅</div>
          <div style={{ fontSize: 28, color: '#00b894' }}>결제가 완료되었습니다!</div>
        </>}

        {phase === 'failed' && <>
          <div style={{ fontSize: 80 }}>❌</div>
          <div style={{ fontSize: 24, color: '#e94560' }}>{errorMsg}</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            <button onClick={() => navigate('/')} style={{
              padding: '14px 30px', fontSize: 18, borderRadius: 10, background: '#636e72', color: '#fff',
            }}>취소</button>
            {retryCount < 3 && (
              <button onClick={handleRetry} style={{
                padding: '14px 30px', fontSize: 18, borderRadius: 10, background: '#6c63ff', color: '#fff',
              }}>재시도 ({3 - retryCount}회 남음)</button>
            )}
          </div>
        </>}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  );
}
