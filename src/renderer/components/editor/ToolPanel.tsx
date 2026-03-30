import React, { useState } from 'react';
import TextTool from './TextTool';

type ToolTab = 'text' | 'image' | 'character';

export default function ToolPanel() {
  const [activeTab, setActiveTab] = useState<ToolTab>('text');

  const tabs: { id: ToolTab; label: string; icon: string }[] = [
    { id: 'text', label: '텍스트', icon: '✏️' },
    { id: 'image', label: '이미지', icon: '🖼️' },
    { id: 'character', label: '캐릭터', icon: '😀' },
  ];

  return (
    <div style={{
      width: 280,
      background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Tab buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
        borderBottom: '1px solid #e5e7eb',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 8px',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              background: activeTab === tab.id ? '#7c3aed' : '#f9fafb',
              color: activeTab === tab.id ? '#ffffff' : '#6b7280',
              border: 'none',
              borderRight: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div>{tab.icon}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'text' && <TextTool />}
        {activeTab === 'image' && (
          <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: 14 }}>이미지 도구 (다음 단계)</p>
          </div>
        )}
        {activeTab === 'character' && (
          <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: 14 }}>캐릭터 도구 (다음 단계)</p>
          </div>
        )}
      </div>
    </div>
  );
}
