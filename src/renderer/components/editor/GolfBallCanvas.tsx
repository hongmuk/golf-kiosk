import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Circle, Group, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { useDesignStore, DesignElement } from '../../stores/designStore';

const CANVAS_SIZE = 500;
const BALL_RADIUS = 220;

interface ImageElementProps {
  element: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
}

function ImageElement({ element, isSelected, onSelect, onDragEnd }: ImageElementProps) {
  const [image] = useImage(element.src || '');

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      stroke={isSelected ? '#7c3aed' : undefined}
      strokeWidth={isSelected ? 3 : 0}
      offsetX={element.width / 2}
      offsetY={element.height / 2}
    />
  );
}

export default function GolfBallCanvas() {
  const elements = useDesignStore((s) => s.elements);
  const selectedId = useDesignStore((s) => s.selectedId);
  const selectElement = useDesignStore((s) => s.selectElement);
  const updateElement = useDesignStore((s) => s.updateElement);
  const groupRef = useRef<any>(null);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage() || e.target.attrs.id === 'background') {
      selectElement(null);
    }
  };

  const handleDragEnd = (id: string) => (e: any) => {
    updateElement(id, { x: e.target.x(), y: e.target.y() });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Stage
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* Background circle */}
          <Circle
            id="background"
            x={CANVAS_SIZE / 2}
            y={CANVAS_SIZE / 2}
            radius={BALL_RADIUS}
            fill="#ffffff"
            stroke="#cccccc"
            strokeWidth={2}
          />

          {/* Clipped content group */}
          <Group
            ref={groupRef}
            clipFunc={(ctx) => {
              ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, BALL_RADIUS, 0, Math.PI * 2);
            }}
          >
            {elements.map((element) => {
              const isSelected = element.id === selectedId;

              if (element.type === 'text') {
                return (
                  <Text
                    key={element.id}
                    text={element.text || ''}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    fontSize={element.fontSize || 24}
                    fontFamily={element.fontFamily || 'Arial'}
                    fill={element.fill || '#000000'}
                    rotation={element.rotation}
                    draggable
                    onClick={() => selectElement(element.id)}
                    onTap={() => selectElement(element.id)}
                    onDragEnd={handleDragEnd(element.id)}
                    stroke={isSelected ? '#7c3aed' : undefined}
                    strokeWidth={isSelected ? 2 : 0}
                    offsetX={element.width / 2}
                    offsetY={element.height / 2}
                  />
                );
              }

              if (element.type === 'image' || element.type === 'character') {
                return (
                  <ImageElement
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => selectElement(element.id)}
                    onDragEnd={handleDragEnd(element.id)}
                  />
                );
              }

              return null;
            })}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
