import React, { useState, useEffect } from 'react';
import { useDesignStore } from '../../stores/designStore';

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia'];
const COLORS = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

export default function TextTool() {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [fill, setFill] = useState('#000000');

  const selectedId = useDesignStore((s) => s.selectedId);
  const elements = useDesignStore((s) => s.elements);
  const addElement = useDesignStore((s) => s.addElement);
  const updateElement = useDesignStore((s) => s.updateElement);

  const selectedElement = elements.find((el) => el.id === selectedId);
  const isTextSelected = selectedElement && selectedElement.type === 'text';

  useEffect(() => {
    if (isTextSelected) {
      setText(selectedElement.text || '');
      setFontFamily(selectedElement.fontFamily || 'Arial');
      setFontSize(selectedElement.fontSize || 24);
      setFill(selectedElement.fill || '#000000');
    }
  }, [selectedId, isTextSelected, selectedElement]);

  const handleAddText = () => {
    if (!text.trim()) {
      alert('텍스트를 입력해주세요.');
      return;
    }

    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text' as const,
      x: 250,
      y: 250,
      width: 200,
      height: fontSize * 1.2,
      rotation: 0,
      text,
      fontFamily,
      fontSize,
      fill,
    };

    addElement(newElement);
    setText('');
  };

  const handleUpdateText = () => {
    if (!isTextSelected || !selectedId) return;

    if (!text.trim()) {
      alert('텍스트를 입력해주세요.');
      return;
    }

    updateElement(selectedId, {
      text,
      fontFamily,
      fontSize,
      fill,
      height: fontSize * 1.2,
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>텍스트 추가</h3>

      {/* Text input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, marginBottom: 8, fontWeight: 'bold' }}>
          텍스트
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="텍스트 입력"
          style={{
            width: '100%',
            padding: 10,
            fontSize: 14,
            border: '1px solid #d1d5db',
            borderRadius: 6,
            outline: 'none',
          }}
        />
      </div>

      {/* Font selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, marginBottom: 8, fontWeight: 'bold' }}>
          폰트
        </label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            fontSize: 14,
            border: '1px solid #d1d5db',
            borderRadius: 6,
            outline: 'none',
          }}
        >
          {FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font size slider */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, marginBottom: 8, fontWeight: 'bold' }}>
          크기: {fontSize}px
        </label>
        <input
          type="range"
          min="12"
          max="72"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Color palette */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, marginBottom: 8, fontWeight: 'bold' }}>
          색상
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map((color) => (
            <div
              key={color}
              onClick={() => setFill(color)}
              style={{
                width: 32,
                height: 32,
                background: color,
                borderRadius: 6,
                cursor: 'pointer',
                border: fill === color ? '3px solid #7c3aed' : '1px solid #d1d5db',
              }}
            />
          ))}
        </div>
      </div>

      {/* Action button */}
      {isTextSelected ? (
        <button
          onClick={handleUpdateText}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 14,
            fontWeight: 'bold',
            background: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          수정 적용
        </button>
      ) : (
        <button
          onClick={handleAddText}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 14,
            fontWeight: 'bold',
            background: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          텍스트 추가
        </button>
      )}
    </div>
  );
}
