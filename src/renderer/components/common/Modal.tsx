import React from 'react';

interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#16213e', borderRadius: 16, padding: 30, minWidth: 400, maxWidth: 600, border: '1px solid #0f3460' }}>
        <h2 style={{ fontSize: 22, marginBottom: 20, color: '#fff' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
