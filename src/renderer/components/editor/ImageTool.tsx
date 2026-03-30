import React, { useState } from 'react';
import { useIpc } from '../../hooks/useIpc';
import { useDesignStore } from '../../stores/designStore';

export default function ImageTool() {
  const api = useIpc();
  const addElement = useDesignStore((s) => s.addElement);
  const [images, setImages] = useState<{ path: string; name: string; size: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleLoadImages = async () => {
    setLoading(true);
    try {
      const result = await api.listUsbImages();
      setImages(result);
      if (result.length === 0) {
        alert('USB 메모리에서 이미지를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      alert('USB 메모리를 읽는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = async (imagePath: string) => {
    setSelectedPath(imagePath);
    try {
      const dataUrl = await api.readUsbImage(imagePath);

      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = width * ratio;
          height = height * ratio;
        }

        const newElement = {
          id: `image-${Date.now()}`,
          type: 'image' as const,
          x: 250,
          y: 250,
          width,
          height,
          rotation: 0,
          src: dataUrl,
        };

        addElement(newElement);
        setSelectedPath(null);
      };
      img.src = dataUrl;
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('이미지를 불러오는 중 오류가 발생했습니다.');
      setSelectedPath(null);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>이미지 추가</h3>

      <button
        onClick={handleLoadImages}
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          fontSize: 14,
          fontWeight: 'bold',
          background: '#7c3aed',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 16,
        }}
      >
        {loading ? '로딩 중...' : 'USB에서 이미지 가져오기'}
      </button>

      {images.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>
            {images.length}개의 이미지를 찾았습니다
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            maxHeight: 400,
            overflowY: 'auto',
          }}>
            {images.map((image) => (
              <div
                key={image.path}
                onClick={() => handleSelectImage(image.path)}
                style={{
                  padding: 8,
                  background: selectedPath === image.path ? '#f3f4f6' : '#ffffff',
                  border: selectedPath === image.path ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '100%',
                  height: 80,
                  background: '#f3f4f6',
                  borderRadius: 6,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                }}>
                  🖼️
                </div>
                <p style={{
                  fontSize: 11,
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {image.name}
                </p>
                <p style={{ fontSize: 10, color: '#9ca3af' }}>
                  {(image.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
