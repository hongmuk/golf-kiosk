export interface ElectronAPI {
  platform: string;
  dbQuery: (sql: string, params?: unknown[]) => Promise<unknown[]>;
  dbExecute: (sql: string, params?: unknown[]) => Promise<{ changes: number; lastInsertRowid: number }>;
  getSetting: (key: string) => Promise<string | null>;
  getAllSettings: () => Promise<Record<string, string>>;
  setSetting: (key: string, value: string) => Promise<boolean>;
  printImage: (imageDataUrl: string) => Promise<{ success: boolean; error?: string }>;
  getPrinterStatus: () => Promise<{ connected: boolean; status: string }>;
  requestPayment: (amount: number) => Promise<{ success: boolean; transactionId?: string; approvalNo?: string; error?: string }>;
  cancelPayment: (transactionId: string) => Promise<{ success: boolean; error?: string }>;
  cutDesign: (designData: string) => Promise<{ success: boolean; error?: string }>;
  listUsbImages: () => Promise<{ path: string; name: string; size: number }[]>;
  readUsbImage: (filePath: string) => Promise<string>;
  getHardwareStatus: () => Promise<{ printer: boolean; payment: boolean; cutter: boolean }>;
  onUsbDetect: (callback: (event: unknown, data: unknown) => void) => void;
  onPaymentResult: (callback: (event: unknown, data: unknown) => void) => void;
  onPrinterStatus: (callback: (event: unknown, data: unknown) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
