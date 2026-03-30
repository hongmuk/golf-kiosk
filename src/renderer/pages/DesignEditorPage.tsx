import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import GolfBallCanvas from '../components/editor/GolfBallCanvas';
import LayerPanel from '../components/editor/LayerPanel';
import ToolPanel from '../components/editor/ToolPanel';
import { useDesignStore } from '../stores/designStore';

export default function DesignEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const elements = useDesignStore((s) => s.elements);
  const clearAll = useDesignStore((s) => s.clearAll);
  const setProductType = useDesignStore((s) => s.setProductType);

  useEffect(() => {
    const state = location.state as { productType?: 'golf_ball' | 'sticker' };
    if (state?.productType) {
      setProductType(state.productType);
    }
  }, [location.state, setProductType]);

  const handleClear = () => {
    if (confirm('모든 디자인을 초기화하시겠습니까?')) {
      clearAll();
    }
  };

  const handleNext = () => {
    if (elements.length === 0) {
      alert('디자인 요소를 추가해주세요.');
      return;
    }
    navigate('/preview');
  };

  const productName = location.state?.productType === 'sticker' ? '스티커 디자인' : '골프공 디자인';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={productName} showBack={true}>
        <button
          onClick={handleClear}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            background: '#6b7280',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            marginRight: 12,
          }}
        >
          초기화
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            background: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          다음 →
        </button>
      </TopBar>

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left: Tool Panel */}
        <ToolPanel />

        {/* Center: Canvas */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3f4f6',
        }}>
          <GolfBallCanvas />
        </div>

        {/* Right: Layer Panel */}
        <LayerPanel />
      </div>
    </div>
  );
}
