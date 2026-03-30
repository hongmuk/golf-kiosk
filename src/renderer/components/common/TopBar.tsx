import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
}

export default function TopBar({ title, showBack = true, rightContent }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <div style={{ height: 60, background: '#2d3436', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        {showBack && (
          <button onClick={() => navigate(-1)} style={{ color: '#fff', fontSize: 16, background: 'none', padding: '8px 16px' }}>← 뒤로</button>
        )}
        <span style={{ color: '#ddd', fontSize: 18, fontWeight: 'bold' }}>{title}</span>
      </div>
      {rightContent && <div style={{ display: 'flex', gap: 12 }}>{rightContent}</div>}
    </div>
  );
}
