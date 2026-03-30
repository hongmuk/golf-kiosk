import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';

interface Character { id: number; name: string; category: string; image_path: string; is_active: number; }
interface Font { id: number; name: string; file_path: string; is_active: number; }

export default function AdminContent() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [fonts, setFonts] = useState<Font[]>([]);
  const api = useIpc();

  const loadData = async () => {
    setCharacters(await api.dbQuery('SELECT * FROM characters ORDER BY sort_order') as Character[]);
    setFonts(await api.dbQuery('SELECT * FROM fonts ORDER BY sort_order') as Font[]);
  };
  useEffect(() => { loadData(); }, []);

  const toggleChar = async (id: number, current: number) => {
    await api.dbExecute('UPDATE characters SET is_active = ? WHERE id = ?', [current ? 0 : 1, id]);
    loadData();
  };

  const deleteChar = async (id: number) => {
    await api.dbExecute('DELETE FROM characters WHERE id = ?', [id]);
    loadData();
  };

  const toggleFont = async (id: number, current: number) => {
    await api.dbExecute('UPDATE fonts SET is_active = ? WHERE id = ?', [current ? 0 : 1, id]);
    loadData();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>콘텐츠 관리</h1>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>캐릭터 ({characters.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 30 }}>
        {characters.map((c) => (
          <div key={c.id} style={{
            background: '#16213e', borderRadius: 8, padding: 12, textAlign: 'center',
            opacity: c.is_active ? 1 : 0.4,
          }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>{c.name} ({c.category})</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <button onClick={() => toggleChar(c.id, c.is_active)} style={{
                padding: '4px 10px', fontSize: 11, borderRadius: 4,
                background: c.is_active ? '#e94560' : '#00b894', color: '#fff',
              }}>{c.is_active ? '비활성화' : '활성화'}</button>
              <button onClick={() => deleteChar(c.id)} style={{
                padding: '4px 10px', fontSize: 11, borderRadius: 4, background: '#636e72', color: '#fff',
              }}>삭제</button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>폰트 ({fonts.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fonts.map((f) => (
          <div key={f.id} style={{
            background: '#16213e', borderRadius: 8, padding: 12,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            opacity: f.is_active ? 1 : 0.4,
          }}>
            <span style={{ fontSize: 14 }}>{f.name}</span>
            <button onClick={() => toggleFont(f.id, f.is_active)} style={{
              padding: '4px 12px', fontSize: 12, borderRadius: 4,
              background: f.is_active ? '#e94560' : '#00b894', color: '#fff',
            }}>{f.is_active ? '비활성화' : '활성화'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
