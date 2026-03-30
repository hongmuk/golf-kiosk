import React, { useState, useEffect } from 'react';
import { useIpc } from '../../hooks/useIpc';
import { useDesignStore } from '../../stores/designStore';

interface Character {
  id: number;
  name: string;
  category: string;
  image_path: string;
  is_active: number;
  sort_order: number;
  created_at: string;
}

export default function CharacterTool() {
  const api = useIpc();
  const addElement = useDesignStore((s) => s.addElement);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [categories, setCategories] = useState<string[]>(['전체']);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const result = await api.dbQuery('SELECT * FROM characters WHERE is_active = 1 ORDER BY sort_order') as Character[];
      setCharacters(result);

      // Extract unique categories
      const cats = ['전체', ...Array.from(new Set(result.map(c => c.category)))];
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = (character: Character) => {
    // For now, we'll use the image_path as src
    // In production, you'd need to properly handle the file path
    const imageSrc = character.image_path;

    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      const maxSize = 150;
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = width * ratio;
        height = height * ratio;
      }

      const newElement = {
        id: `character-${Date.now()}`,
        type: 'character' as const,
        x: 250,
        y: 250,
        width,
        height,
        rotation: 0,
        src: imageSrc,
      };

      addElement(newElement);
    };
    img.onerror = () => {
      // Fallback if image can't be loaded
      const newElement = {
        id: `character-${Date.now()}`,
        type: 'character' as const,
        x: 250,
        y: 250,
        width: 100,
        height: 100,
        rotation: 0,
        src: imageSrc,
      };
      addElement(newElement);
    };
    img.src = imageSrc;
  };

  const filteredCharacters = selectedCategory === '전체'
    ? characters
    : characters.filter(c => c.category === selectedCategory);

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#9ca3af' }}>로딩 중...</p>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 40 }}>
          등록된 캐릭터가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>캐릭터 추가</h3>

      {/* Category filter */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                background: selectedCategory === cat ? '#7c3aed' : '#f3f4f6',
                color: selectedCategory === cat ? '#ffffff' : '#6b7280',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Character grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        maxHeight: 500,
        overflowY: 'auto',
      }}>
        {filteredCharacters.map((character) => (
          <div
            key={character.id}
            onClick={() => handleSelectCharacter(character)}
            style={{
              padding: 8,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.background = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            <div style={{
              width: '100%',
              height: 60,
              background: '#f3f4f6',
              borderRadius: 6,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {character.image_path ? (
                <img
                  src={character.image_path}
                  alt={character.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span style="font-size: 32px;">😀</span>';
                  }}
                />
              ) : (
                <span style={{ fontSize: 32 }}>😀</span>
              )}
            </div>
            <p style={{
              fontSize: 10,
              color: '#6b7280',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {character.name}
            </p>
          </div>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 20 }}>
          해당 카테고리에 캐릭터가 없습니다
        </p>
      )}
    </div>
  );
}
