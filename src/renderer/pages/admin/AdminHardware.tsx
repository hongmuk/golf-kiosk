import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';

export default function AdminHardware() {
  const [status, setStatus] = useState({ printer: false, payment: false, cutter: false });
  const api = useIpc();

  const refresh = async () => setStatus(await api.getHardwareStatus());
  useEffect(() => { refresh(); }, []);

  const devices = [
    { key: 'printer', label: '🖨️ USB 프린터', ok: status.printer },
    { key: 'payment', label: '💳 KICC 결제기', ok: status.payment },
    { key: 'cutter', label: '✂️ 커팅기', ok: status.cutter },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>하드웨어 상태</h1>
      <button onClick={refresh} style={{
        padding: '8px 20px', borderRadius: 8, background: '#6c63ff', color: '#fff', fontSize: 14, marginBottom: 20,
      }}>새로고침</button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {devices.map((d) => (
          <div key={d.key} style={{
            background: '#16213e', borderRadius: 12, padding: 20,
            border: `1px solid ${d.ok ? '#00b894' : '#e94560'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontSize: 18 }}>{d.label}</div>
            <div style={{ fontSize: 16, color: d.ok ? '#00b894' : '#e94560', fontWeight: 'bold' }}>
              {d.ok ? '✅ 연결됨' : '❌ 연결 안됨'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
