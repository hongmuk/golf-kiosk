import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage, Layer, Circle, Group, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import TopBar from '../components/common/TopBar';
import { useDesignStore, DesignElement } from '../stores/designStore';
import { useOrderStore } from '../stores/orderStore';
import { useAppStore } from '../stores/appStore';

const PREVIEW_SIZE = 600;
const BALL_RADIUS = 260;
const SCALE = PREVIEW_SIZE / 500;

function PreviewImage({ el }: { el: DesignElement }) {
  const [img] = useImage(el.src || '');
  return <KonvaImage image={img} x={el.x * SCALE} y={el.y * SCALE}
    width={el.width * SCALE} height={el.height * SCALE} rotation={el.rotation} />;
}

export default function PreviewPage() {
  const navigate = useNavigate();
  const elements = useDesignStore((s) => s.elements);
  const productType = useDesignStore((s) => s.productType);
  const settings = useAppStore((s) => s.settings);
  const setOrder = useOrderStore((s) => s.setOrder);
  const stageRef = useRef<any>(null);

  const price = productType === 'golf_ball'
    ? parseInt(settings.price_golf_ball || '5000', 10)
    : parseInt(settings.price_sticker || '3000', 10);

  const handlePay = () => {
    const designDataJson = JSON.stringify(elements);
    setOrder({ productType, amount: price, designDataJson });
    navigate('/payment');
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="인쇄 미리보기" />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', gap: 60,
      }}>
        <Stage ref={stageRef} width={PREVIEW_SIZE} height={PREVIEW_SIZE}>
          <Layer>
            <Circle x={PREVIEW_SIZE / 2} y={PREVIEW_SIZE / 2} radius={BALL_RADIUS}
              fill="#f5f5f5" shadowColor="rgba(0,0,0,0.3)" shadowBlur={30} shadowOffset={{ x: 8, y: 8 }} />
            <Group clipFunc={(ctx: any) => {
              ctx.arc(PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, BALL_RADIUS, 0, Math.PI * 2);
            }}>
              {elements.map((el) => {
                if (el.type === 'text') {
                  return <Text key={el.id} text={el.text} x={el.x * SCALE} y={el.y * SCALE}
                    fontSize={(el.fontSize || 24) * SCALE} fontFamily={el.fontFamily}
                    fill={el.fill} rotation={el.rotation} />;
                }
                return <PreviewImage key={el.id} el={el} />;
              })}
            </Group>
          </Layer>
        </Stage>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold' }}>
            {productType === 'golf_ball' ? '⛳ 골프공 인쇄' : '✂️ 스티커 커팅'}
          </div>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#6c63ff' }}>
            {price.toLocaleString()}원
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <button onClick={() => navigate('/editor', { state: { productType } })} style={{
              padding: '16px 40px', fontSize: 20, borderRadius: 12,
              background: '#636e72', color: '#fff',
            }}>← 수정하기</button>
            <button onClick={handlePay} style={{
              padding: '16px 40px', fontSize: 20, borderRadius: 12,
              background: '#6c63ff', color: '#fff', fontWeight: 'bold',
            }}>결제하기 →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
