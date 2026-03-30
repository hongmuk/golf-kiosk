import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/admin', label: '📊 대시보드', end: true },
  { path: '/admin/orders', label: '💰 결제 내역', end: false },
  { path: '/admin/pricing', label: '💲 가격 설정', end: false },
  { path: '/admin/hardware', label: '🔧 하드웨어', end: false },
  { path: '/admin/content', label: '🎨 콘텐츠', end: false },
  { path: '/admin/settings', label: '⚙️ 시스템 설정', end: false },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{
        width: 240, background: '#0f3460', display: 'flex', flexDirection: 'column',
        padding: '20px 0',
      }}>
        <div style={{ padding: '0 20px 20px', fontSize: 18, fontWeight: 'bold', color: '#6c63ff' }}>
          🔧 관리자 모드
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end}
            style={({ isActive }) => ({
              display: 'block', padding: '14px 20px', fontSize: 15,
              color: isActive ? '#fff' : '#8899aa', textDecoration: 'none',
              background: isActive ? '#16213e' : 'transparent',
              borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent',
            })}>
            {item.label}
          </NavLink>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate('/')} style={{
          margin: '0 20px', padding: 12, borderRadius: 8,
          background: '#e94560', color: '#fff', fontSize: 14,
        }}>
          키오스크 모드로 돌아가기
        </button>
      </div>
      <div style={{ flex: 1, background: '#1a1a2e', overflowY: 'auto', padding: 30 }}>
        <Outlet />
      </div>
    </div>
  );
}
