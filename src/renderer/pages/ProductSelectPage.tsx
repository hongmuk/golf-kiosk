import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import TopBar from '../components/common/TopBar';

export default function ProductSelectPage() {
  const navigate = useNavigate();
  const settings = useAppStore((s) => s.settings);

  const golfBallPrice = settings.golf_ball_price || '10000';
  const stickerPrice = settings.sticker_price || '5000';

  const handleProductSelect = (productType: 'golf_ball' | 'sticker') => {
    navigate('/editor', { state: { productType } });
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="상품 선택" showBack={true} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, padding: 60 }}>
        {/* 골프공 인쇄 카드 */}
        <div
          onClick={() => handleProductSelect('golf_ball')}
          style={{
            width: 600,
            height: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 24,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            border: '3px solid transparent',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.borderColor = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: 120, marginTop: 40 }}>⛳</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 20, color: '#fff' }}>골프공 인쇄</h2>
            <p style={{ fontSize: 20, color: '#f0f0f0', lineHeight: 1.6, marginBottom: 30 }}>
              고품질 UV 프린팅으로<br />
              나만의 골프공을 만들어보세요
            </p>
            <div style={{ fontSize: 42, fontWeight: 'bold', color: '#fff', background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '15px 30px' }}>
              {parseInt(golfBallPrice).toLocaleString()}원
            </div>
          </div>
        </div>

        {/* 스티커 커팅 카드 */}
        <div
          onClick={() => handleProductSelect('sticker')}
          style={{
            width: 600,
            height: 700,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: 24,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            border: '3px solid transparent',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.borderColor = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: 120, marginTop: 40 }}>✨</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 20, color: '#fff' }}>스티커 커팅</h2>
            <p style={{ fontSize: 20, color: '#f0f0f0', lineHeight: 1.6, marginBottom: 30 }}>
              정밀한 커팅으로<br />
              원하는 모양의 스티커를 제작하세요
            </p>
            <div style={{ fontSize: 42, fontWeight: 'bold', color: '#fff', background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '15px 30px' }}>
              {parseInt(stickerPrice).toLocaleString()}원
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
