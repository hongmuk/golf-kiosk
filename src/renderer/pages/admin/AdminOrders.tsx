import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';

interface Order {
  id: number; product_type: string; amount: number;
  payment_status: string; print_status: string; created_at: string;
  kicc_transaction_id: string; kicc_approval_no: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const api = useIpc();

  const load = async () => {
    const where = filter === 'all' ? '' : `WHERE payment_status = '${filter}'`;
    const rows = await api.dbQuery(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT 100`
    ) as Order[];
    setOrders(rows);
  };

  useEffect(() => { load(); }, [filter]);

  const handleRefund = async (order: Order) => {
    if (order.payment_status !== 'completed') return;
    const result = await api.cancelPayment(order.kicc_transaction_id);
    if (result.success) {
      await api.dbExecute(
        "UPDATE orders SET payment_status = 'refunded' WHERE id = ?", [order.id]
      );
      load();
    }
  };

  const statusColors: Record<string, string> = {
    completed: '#00b894', failed: '#e94560', refunded: '#fdcb6e', pending: '#888',
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>결제 내역</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'completed', 'failed', 'refunded'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13,
            background: filter === f ? '#6c63ff' : '#16213e', color: '#fff',
          }}>{f === 'all' ? '전체' : f === 'completed' ? '완료' : f === 'failed' ? '실패' : '환불'}</button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #0f3460' }}>
            {['ID', '상품', '금액', '결제상태', '인쇄상태', '일시', ''].map((h) => (
              <th key={h} style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#888' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid #0f3460' }}>
              <td style={{ padding: 10, fontSize: 13 }}>{o.id}</td>
              <td style={{ padding: 10, fontSize: 13 }}>{o.product_type === 'golf_ball' ? '골프공' : '스티커'}</td>
              <td style={{ padding: 10, fontSize: 13 }}>{o.amount.toLocaleString()}원</td>
              <td style={{ padding: 10, fontSize: 13, color: statusColors[o.payment_status] }}>{o.payment_status}</td>
              <td style={{ padding: 10, fontSize: 13 }}>{o.print_status}</td>
              <td style={{ padding: 10, fontSize: 13, color: '#888' }}>{o.created_at}</td>
              <td style={{ padding: 10 }}>
                {o.payment_status === 'completed' && (
                  <button onClick={() => handleRefund(o)} style={{
                    padding: '6px 12px', fontSize: 12, borderRadius: 6,
                    background: '#e94560', color: '#fff',
                  }}>환불</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
