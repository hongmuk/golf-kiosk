import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIpc } from '../hooks/useIpc';
import { useOrderStore } from '../stores/orderStore';

type PrintPhase = 'prepare' | 'printing' | 'done' | 'error';

export default function PrintingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<PrintPhase>('prepare');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const orderId = useOrderStore((s) => s.orderId);
  const designDataJson = useOrderStore((s) => s.designDataJson);
  const api = useIpc();

  useEffect(() => {
    let cancelled = false;
    async function runPrint() {
      setPhase('prepare');
      await new Promise((r) => setTimeout(r, 1500));
      if (cancelled) return;

      setPhase('printing');
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 300);

      const result = await api.printImage(designDataJson);
      clearInterval(progressInterval);
      if (cancelled) return;

      if (result.success) {
        setProgress(100);
        setPhase('done');
        if (orderId) {
          await api.dbExecute(
            "UPDATE orders SET print_status = 'completed', completed_at = datetime('now','localtime') WHERE id = ?",
            [orderId]
          );
          await api.dbExecute(
            "INSERT INTO print_logs (order_id, status, message) VALUES (?, 'completed', '인쇄 완료')",
            [orderId]
          );
        }
        setTimeout(() => navigate('/complete'), 1000);
      } else {
        setPhase('error');
        setErrorMsg(result.error || '인쇄 중 오류가 발생했습니다.');
        if (orderId) {
          await api.dbExecute("UPDATE orders SET print_status = 'failed' WHERE id = ?", [orderId]);
          await api.dbExecute(
            "INSERT INTO print_logs (order_id, status, message) VALUES (?, 'error', ?)",
            [orderId, result.error || 'unknown error']
          );
        }
      }
    }
    runPrint();
    return () => { cancelled = true; };
  }, []);

  const messages: Record<PrintPhase, string> = {
    prepare: '골프공을 인쇄대에 올려주세요...',
    printing: '인쇄 중입니다. 잠시만 기다려주세요...',
    done: '인쇄가 완료되었습니다!',
    error: errorMsg,
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', gap: 30,
    }}>
      <div style={{ fontSize: 80 }}>
        {phase === 'error' ? '❌' : phase === 'done' ? '✅' : '🖨️'}
      </div>
      <div style={{ fontSize: 32, fontWeight: 'bold' }}>{messages[phase]}</div>

      {(phase === 'prepare' || phase === 'printing') && (
        <div style={{ width: 500, height: 12, background: '#0f3460', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#6c63ff', borderRadius: 6,
            width: `${progress}%`, transition: 'width 0.3s',
          }} />
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          <button onClick={() => navigate('/')} style={{
            padding: '14px 30px', fontSize: 18, borderRadius: 10,
            background: '#636e72', color: '#fff',
          }}>처음으로</button>
          <div style={{ fontSize: 16, color: '#e94560', marginTop: 20 }}>
            관리자를 호출해 주세요
          </div>
        </div>
      )}
    </div>
  );
}
