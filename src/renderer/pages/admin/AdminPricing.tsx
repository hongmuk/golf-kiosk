import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useIpc } from '../../hooks/useIpc';

export default function AdminPricing() {
  const settings = useAppStore((s) => s.settings);
  const updateSetting = useAppStore((s) => s.updateSetting);
  const [golfPrice, setGolfPrice] = useState(settings.price_golf_ball || '5000');
  const [stickerPrice, setStickerPrice] = useState(settings.price_sticker || '3000');
  const [saved, setSaved] = useState(false);
  const api = useIpc();

  const handleSave = async () => {
    await api.setSetting('price_golf_ball', golfPrice);
    await api.setSetting('price_sticker', stickerPrice);
    updateSetting('price_golf_ball', golfPrice);
    updateSetting('price_sticker', stickerPrice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>가격 설정</h1>
      <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontSize: 14, color: '#888', display: 'block', marginBottom: 6 }}>골프공 인쇄 가격 (원)</label>
          <input type="number" value={golfPrice} onChange={(e) => setGolfPrice(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #0f3460', background: '#16213e', color: '#fff' }} />
        </div>
        <div>
          <label style={{ fontSize: 14, color: '#888', display: 'block', marginBottom: 6 }}>스티커 커팅 가격 (원)</label>
          <input type="number" value={stickerPrice} onChange={(e) => setStickerPrice(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #0f3460', background: '#16213e', color: '#fff' }} />
        </div>
        <button onClick={handleSave} style={{
          padding: 14, fontSize: 16, borderRadius: 8, background: '#6c63ff', color: '#fff', fontWeight: 'bold',
        }}>{saved ? '✅ 저장 완료!' : '저장'}</button>
      </div>
    </div>
  );
}
