import { ipcMain, BrowserWindow } from 'electron';
import { printImage, getPrinterStatus } from '../hardware/printer';
import { getDb } from '../database/connection';

export function registerPrinterIpc(): void {
  ipcMain.handle('printer:print', async (_event, imageDataUrl: string) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('printer_name') as { value: string } | undefined;
    const printerName = row?.value || '';
    const result = await printImage(imageDataUrl, printerName);
    const win = BrowserWindow.getAllWindows()[0];
    if (win) { win.webContents.send('printer:status', result); }
    return result;
  });

  ipcMain.handle('printer:status', () => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('printer_name') as { value: string } | undefined;
    return getPrinterStatus(row?.value || '');
  });
}
