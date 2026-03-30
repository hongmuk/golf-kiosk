import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './stores/appStore';
import { useIpc } from './hooks/useIpc';
import { useIdleTimer } from './hooks/useIdleTimer';
import HomePage from './pages/HomePage';
import ProductSelectPage from './pages/ProductSelectPage';
import DesignEditorPage from './pages/DesignEditorPage';
import PreviewPage from './pages/PreviewPage';
import CompletePage from './pages/CompletePage';
import PrintingPage from './pages/PrintingPage';
import PaymentPage from './pages/PaymentPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPricing from './pages/admin/AdminPricing';

function AppContent() {
  const setSettings = useAppStore((s) => s.setSettings);
  const api = useIpc();
  useEffect(() => { api.getAllSettings().then(setSettings); }, []);
  useIdleTimer();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product-select" element={<ProductSelectPage />} />
      <Route path="/editor" element={<DesignEditorPage />} />
      <Route path="/preview" element={<PreviewPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/printing" element={<PrintingPage />} />
      <Route path="/complete" element={<CompletePage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="pricing" element={<AdminPricing />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return <HashRouter><AppContent /></HashRouter>;
}
