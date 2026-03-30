import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { useDesignStore } from '../stores/designStore';
import { useOrderStore } from '../stores/orderStore';

export default function CompletePage() {
  const navigate = useNavigate();
  const settings = useAppStore((s) => s.settings);
  const clearAll = useDesignStore((s) => s.clearAll);
  const resetOrder = useOrderStore((s) => s.reset);
  const timeout = parseInt(settings.complete_timeout || '10', 10) * 1000;

  useEffect(() => {
    const timer = setTimeout(() => {
      clearAll(); resetOrder(); navigate('/');
    }, timeout);
    return () => clearTimeout(timer);
  }, []);

  const handleHome = () => { clearAll(); resetOrder(); navigate('/'); };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', gap: 30,
    }}>
      <div style={{ fontSize: 120 }}>✅</div>
      <div style={{ fontSize: 48, fontWeight: 'bold' }}>인쇄가 완료되었습니다!</div>
      <div style={{ fontSize: 24, color: '#aaa' }}>골프공을 수령해 주세요</div>
      <button onClick={handleHome} style={{
        marginTop: 30, padding: '16px 50px', fontSize: 20, borderRadius: 12,
        background: '#6c63ff', color: '#fff', fontWeight: 'bold',
      }}>처음으로</button>
      <div style={{ fontSize: 14, color: '#666', marginTop: 10 }}>
        {Math.round(timeout / 1000)}초 후 자동으로 처음 화면으로 돌아갑니다
      </div>
    </div>
  );
}
