import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import Modal from '../components/common/Modal';

export default function HomePage() {
  const navigate = useNavigate();
  const settings = useAppStore((s) => s.settings);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdminAreaTap = () => {
    tapCountRef.current += 1;
    if (tapCountRef.current === 1) {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 2000);
    }
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      setShowAdminModal(true);
    }
  };

  const handleAdminLogin = () => {
    const adminPassword = settings.admin_password || 'admin1234';
    if (password === adminPassword) {
      setShowAdminModal(false);
      setPassword('');
      setError('');
      navigate('/admin');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleCloseModal = () => {
    setShowAdminModal(false);
    setPassword('');
    setError('');
  };

  return (
    <div onClick={() => navigate('/product-select')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .pulse-text {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="pulse-text" style={{ fontSize: 72, fontWeight: 'bold', color: '#6c63ff', textAlign: 'center' }}>
        터치하여 시작하세요
      </div>
      <div style={{ fontSize: 28, color: '#aaa', marginTop: 20, textAlign: 'center' }}>
        골프공 인쇄 / 스티커 커팅 서비스
      </div>

      <div
        onClick={(e) => {
          e.stopPropagation();
          handleAdminAreaTap();
        }}
        style={{ position: 'absolute', bottom: 0, right: 0, width: 100, height: 100, background: 'transparent' }}
      />

      <Modal open={showAdminModal} onClose={handleCloseModal} title="관리자 로그인">
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#ddd' }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
            style={{ width: '100%', padding: 12, fontSize: 16, border: '1px solid #0f3460', borderRadius: 8, background: '#0f3460', color: '#fff', marginBottom: 12 }}
            autoFocus
          />
          {error && <div style={{ color: '#ff6b6b', fontSize: 14, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleCloseModal} style={{ flex: 1, padding: 12, fontSize: 16, background: '#555', color: '#fff', borderRadius: 8 }}>취소</button>
            <button onClick={handleAdminLogin} style={{ flex: 1, padding: 12, fontSize: 16, background: '#6c63ff', color: '#fff', borderRadius: 8 }}>확인</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
