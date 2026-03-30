import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';

interface Stats {
  todaySales: number; todayCount: number;
  weekSales: number; weekCount: number;
  monthSales: number; monthCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ todaySales: 0, todayCount: 0, weekSales: 0, weekCount: 0, monthSales: 0, monthCount: 0 });
  const [hw, setHw] = useState({ printer: false, payment: false, cutter: false });
  const api = useIpc();

  useEffect(() => {
    async function load() {
      const today = await api.dbQuery(
        "SELECT COALESCE(SUM(amount),0) as sales, COUNT(*) as cnt FROM orders WHERE payment_status='completed' AND date(created_at)=date('now','localtime')"
      ) as any[];
      const week = await api.dbQuery(
        "SELECT COALESCE(SUM(amount),0) as sales, COUNT(*) as cnt FROM orders WHERE payment_status='completed' AND created_at >= datetime('now','localtime','-7 days')"
      ) as any[];
      const month = await api.dbQuery(
        "SELECT COALESCE(SUM(amount),0) as sales, COUNT(*) as cnt FROM orders WHERE payment_status='completed' AND created_at >= datetime('now','localtime','-30 days')"
      ) as any[];

      setStats({
        todaySales: today[0]?.sales || 0, todayCount: today[0]?.cnt || 0,
        weekSales: week[0]?.sales || 0, weekCount: week[0]?.cnt || 0,
        monthSales: month[0]?.sales || 0, monthCount: month[0]?.cnt || 0,
      });

      setHw(await api.getHardwareStatus());
    }
    load();
  }, []);

  const Card = ({ title, value, sub }: { title: string; value: string; sub: string }) => (
    <div style={{
      background: '#16213e', borderRadius: 12, padding: 20,
      border: '1px solid #0f3460', flex: 1,
    }}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 'bold', color: '#6c63ff' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{sub}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>대시보드</h1>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Card title="오늘 매출" value={`${stats.todaySales.toLocaleString()}원`} sub={`${stats.todayCount}건`} />
        <Card title="주간 매출" value={`${stats.weekSales.toLocaleString()}원`} sub={`${stats.weekCount}건`} />
        <Card title="월간 매출" value={`${stats.monthSales.toLocaleString()}원`} sub={`${stats.monthCount}건`} />
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 16 }}>하드웨어 상태</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: '프린터', ok: hw.printer },
          { label: 'KICC 결제기', ok: hw.payment },
          { label: '커팅기', ok: hw.cutter },
        ].map((h) => (
          <div key={h.label} style={{
            background: '#16213e', borderRadius: 12, padding: 16,
            border: `1px solid ${h.ok ? '#00b894' : '#e94560'}`, flex: 1, textAlign: 'center',
          }}>
            <div style={{ fontSize: 30 }}>{h.ok ? '✅' : '❌'}</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>{h.label}</div>
            <div style={{ fontSize: 12, color: h.ok ? '#00b894' : '#e94560' }}>
              {h.ok ? '정상' : '연결 안됨'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
