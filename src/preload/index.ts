import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // DB
  dbQuery: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke('db:query', sql, params),
  dbExecute: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke('db:execute', sql, params),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('settings:get', key),
  getAllSettings: () => ipcRenderer.invoke('settings:get-all'),
  setSetting: (key: string, value: string) =>
    ipcRenderer.invoke('settings:set', key, value),

  // Printer
  printImage: (imageDataUrl: string) =>
    ipcRenderer.invoke('printer:print', imageDataUrl),
  getPrinterStatus: () => ipcRenderer.invoke('printer:status'),

  // Payment
  requestPayment: (amount: number) =>
    ipcRenderer.invoke('payment:request', amount),
  cancelPayment: (transactionId: string) =>
    ipcRenderer.invoke('payment:cancel', transactionId),

  // Cutter
  cutDesign: (designData: string) =>
    ipcRenderer.invoke('cutter:cut', designData),

  // USB
  listUsbImages: () => ipcRenderer.invoke('usb:list-images'),
  readUsbImage: (filePath: string) =>
    ipcRenderer.invoke('usb:read-image', filePath),

  // Hardware status
  getHardwareStatus: () => ipcRenderer.invoke('hardware:status'),

  // Event listeners (Main → Renderer)
  onUsbDetect: (callback: (event: unknown, data: unknown) => void) =>
    ipcRenderer.on('usb:detect', callback),
  onPaymentResult: (callback: (event: unknown, data: unknown) => void) =>
    ipcRenderer.on('payment:result', callback),
  onPrinterStatus: (callback: (event: unknown, data: unknown) => void) =>
    ipcRenderer.on('printer:status', callback),

  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),
});
