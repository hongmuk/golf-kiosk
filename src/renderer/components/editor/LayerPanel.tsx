import React from 'react';
import { useDesignStore } from '../../stores/designStore';

export default function LayerPanel() {
  const elements = useDesignStore((s) => s.elements);
  const selectedId = useDesignStore((s) => s.selectedId);
  const selectElement = useDesignStore((s) => s.selectElement);
  const removeElement = useDesignStore((s) => s.removeElement);
  const moveElementUp = useDesignStore((s) => s.moveElementUp);
  const moveElementDown = useDesignStore((s) => s.moveElementDown);

  const getIcon = (type: string) => {
    if (type === 'text') return '✏️';
    if (type === 'image') return '🖼️';
    if (type === 'character') return '😀';
    return '❓';
  };

  const getLabel = (element: any) => {
    if (element.type === 'text') return element.text || 'Text';
    if (element.type === 'image') return 'Image';
    if (element.type === 'character') return 'Character';
    return 'Element';
  };

  return (
    <div style={{
      width: 220,
      background: '#ffffff',
      borderLeft: '1px solid #e5e7eb',
      padding: 16,
      overflowY: 'auto',
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>레이어</h3>

      {elements.length === 0 && (
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
          레이어가 없습니다
        </p>
      )}

      {elements.map((element, index) => {
        const isSelected = element.id === selectedId;
        return (
          <div
            key={element.id}
            onClick={() => selectElement(element.id)}
            style={{
              padding: 12,
              marginBottom: 8,
              background: isSelected ? '#f3f4f6' : '#ffffff',
              border: isSelected ? '2px solid #7c3aed' : '1px solid #e5e7eb',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{getIcon(element.type)}</span>
                <span style={{ fontSize: 14, fontWeight: isSelected ? 'bold' : 'normal' }}>
                  {getLabel(element)}
                </span>
              </div>
            </div>

            {isSelected && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElementUp(element.id);
                  }}
                  disabled={index === elements.length - 1}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: 12,
                    background: index === elements.length - 1 ? '#e5e7eb' : '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: index === elements.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElementDown(element.id);
                  }}
                  disabled={index === 0}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: 12,
                    background: index === 0 ? '#e5e7eb' : '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ↓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(element.id);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: 12,
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
