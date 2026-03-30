import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Browser mock: inject mock electronAPI if not running in Electron
if (!window.electronAPI) {
  import('./mock-electron-api').then(({ mockElectronAPI }) => {
    (window as any).electronAPI = mockElectronAPI;
    renderApp();
  });
} else {
  renderApp();
}

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode><App /></React.StrictMode>
  );
}
