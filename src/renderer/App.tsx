import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './stores/appStore';
import { useIpc } from './hooks/useIpc';

function Placeholder({ name }: { name: string }) {
  return <div style={{ fontSize: 36, textAlign: 'center', marginTop: 200 }}>{name}</div>;
}

function AppContent() {
  const setSettings = useAppStore((s) => s.setSettings);
  const api = useIpc();
  useEffect(() => { api.getAllSettings().then(setSettings); }, []);

  return (
    <Routes>
      <Route path="/" element={<Placeholder name="홈 화면" />} />
      <Route path="/product-select" element={<Placeholder name="상품 선택" />} />
      <Route path="/editor" element={<Placeholder name="디자인 편집기" />} />
      <Route path="/preview" element={<Placeholder name="미리보기" />} />
      <Route path="/payment" element={<Placeholder name="결제" />} />
      <Route path="/printing" element={<Placeholder name="인쇄 중" />} />
      <Route path="/complete" element={<Placeholder name="완료" />} />
      <Route path="/admin/*" element={<Placeholder name="관리자" />} />
    </Routes>
  );
}

export default function App() {
  return <HashRouter><AppContent /></HashRouter>;
}
