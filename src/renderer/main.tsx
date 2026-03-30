import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return <div style={{ fontSize: 48, textAlign: 'center', marginTop: 200 }}>골프공 키오스크 - 초기 설정 완료</div>;
}

createRoot(document.getElementById('root')!).render(<App />);
