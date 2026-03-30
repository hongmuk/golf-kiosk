// Browser mock for electronAPI — used when running as a web demo (not in Electron)
import type { ElectronAPI } from './types/electron';

const mockSettings: Record<string, string> = {
  price_golf_ball: '5000',
  price_sticker: '3000',
  admin_password: '1234',
  idle_timeout: '120',
  complete_timeout: '10',
  printer_name: 'Demo Printer',
  cutter_port: 'COM3',
};

const mockOrders: any[] = [];
let orderIdCounter = 1;

function parseSql(sql: string, params: unknown[] = []): any[] {
  const sqlLower = sql.toLowerCase().trim();

  // SELECT from settings
  if (sqlLower.includes('from settings') && sqlLower.includes('where key')) {
    const key = params[0] as string;
    if (mockSettings[key]) return [{ key, value: mockSettings[key] }];
    return [];
  }

  // SELECT all settings
  if (sqlLower.includes('select key, value from settings')) {
    return Object.entries(mockSettings).map(([key, value]) => ({ key, value }));
  }

  // INSERT/UPDATE settings
  if (sqlLower.includes('into settings') || sqlLower.includes('update settings')) {
    const key = params[0] as string;
    const value = params[1] as string;
    mockSettings[key] = value;
    return [];
  }

  // SELECT from characters
  if (sqlLower.includes('from characters')) {
    return [];
  }

  // SELECT from fonts
  if (sqlLower.includes('from fonts')) {
    return [];
  }

  // SELECT from orders (aggregation)
  if (sqlLower.includes('sum(amount)') || sqlLower.includes('coalesce')) {
    const completed = mockOrders.filter(o => o.payment_status === 'completed');
    return [{ sales: completed.reduce((s, o) => s + o.amount, 0), cnt: completed.length }];
  }

  // SELECT from orders
  if (sqlLower.includes('from orders')) {
    return [...mockOrders].reverse().slice(0, 100);
  }

  // INSERT into orders
  if (sqlLower.includes('into orders')) {
    const order = {
      id: orderIdCounter++,
      product_type: params[0],
      design_data: params[1],
      amount: params[2],
      payment_status: params[3] || 'completed',
      kicc_transaction_id: params[4] || '',
      kicc_approval_no: params[5] || '',
      print_status: 'pending',
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    mockOrders.push(order);
    return [{ changes: 1, lastInsertRowid: order.id }];
  }

  // UPDATE orders
  if (sqlLower.includes('update orders')) {
    const id = params[params.length - 1] as number;
    const order = mockOrders.find(o => o.id === id);
    if (order) {
      if (sqlLower.includes('print_status')) order.print_status = 'completed';
      if (sqlLower.includes('payment_status')) order.payment_status = 'refunded';
      if (sqlLower.includes('completed_at')) order.completed_at = new Date().toISOString();
    }
    return [];
  }

  // INSERT into print_logs
  if (sqlLower.includes('into print_logs')) {
    return [];
  }

  return [];
}

export const mockElectronAPI: ElectronAPI = {
  platform: 'browser',

  dbQuery: async (sql: string, params?: unknown[]) => {
    return parseSql(sql, params || []);
  },

  dbExecute: async (sql: string, params?: unknown[]) => {
    const result = parseSql(sql, params || []);
    if (result.length > 0 && result[0].lastInsertRowid) {
      return { changes: 1, lastInsertRowid: result[0].lastInsertRowid };
    }
    return { changes: 1, lastInsertRowid: 0 };
  },

  getSetting: async (key: string) => mockSettings[key] || null,

  getAllSettings: async () => ({ ...mockSettings }),

  setSetting: async (key: string, value: string) => {
    mockSettings[key] = value;
    return true;
  },

  printImage: async (_imageDataUrl: string) => {
    await new Promise(r => setTimeout(r, 3000));
    return { success: true };
  },

  getPrinterStatus: async () => ({ connected: true, status: 'ready' }),

  requestPayment: async (_amount: number) => {
    await new Promise(r => setTimeout(r, 3000));
    return {
      success: true,
      transactionId: `TX${Date.now()}`,
      approvalNo: `AP${Math.floor(Math.random() * 900000 + 100000)}`,
    };
  },

  cancelPayment: async (_transactionId: string) => {
    await new Promise(r => setTimeout(r, 1000));
    return { success: true };
  },

  cutDesign: async (_designData: string) => {
    await new Promise(r => setTimeout(r, 2000));
    return { success: true };
  },

  listUsbImages: async () => [],

  readUsbImage: async (_filePath: string) => '',

  getHardwareStatus: async () => ({
    printer: true,
    payment: true,
    cutter: false,
  }),

  onUsbDetect: () => {},
  onPaymentResult: () => {},
  onPrinterStatus: () => {},
  removeAllListeners: () => {},
};
