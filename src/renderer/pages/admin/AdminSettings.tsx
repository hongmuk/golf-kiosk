import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useIpc } from '../../hooks/useIpc';

export default function AdminSettings() {
  const settings = useAppStore((s) => s.settings);
  const updateSetting = useAppStore((s) => s.updateSetting);
  const api = useIpc();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    admin_password: settings.admin_password || '',
    idle_timeout: settings.idle_timeout || '120',
    complete_timeout: settings.complete_timeout || '10',
    printer_name: settings.printer_name || '',
    cutter_port: settings.cutter_port || '',
  });

  const handleChange = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    for (const [key, value] of Object.entries(form)) {
      await api.setSetting(key, value);
      updateSetting(key, value);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: string; label: string; type: string }[] = [
    { key: 'admin_password', label: '관리자 비밀번호', type: 'password' },
    { key: 'idle_timeout', label: '무동작 타임아웃 (초)', type: 'number' },
    { key: 'complete_timeout', label: '완료 화면 자동복귀 (초)', type: 'number' },
    { key: 'printer_name', label: '프린터 이름', type: 'text' },
    { key: 'cutter_port', label: '커팅기 포트', type: 'text' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>시스템 설정</h1>
      <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fields.map((f) => (
          <div key={f.key}>
            <label style={{ fontSize: 14, color: '#888', display: 'block', marginBottom: 6 }}>{f.label}</label>
            <input
              type={f.type}
              value={(form as any)[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #0f3460', background: '#16213e', color: '#fff' }}
            />
          </div>
        ))}
        <button onClick={handleSave} style={{
          padding: 14, fontSize: 16, borderRadius: 8, background: '#6c63ff', color: '#fff', fontWeight: 'bold',
        }}>{saved ? '✅ 저장 완료!' : '저장'}</button>
        <div style={{ marginTop: 20, fontSize: 12, color: '#666' }}>앱 버전: 1.0.0</div>
      </div>
    </div>
  );
}
