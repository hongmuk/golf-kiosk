import { ipcMain } from 'electron';
import { cutDesign, getCutterStatus } from '../hardware/cutter';
import { getDb } from '../database/connection';

export function registerCutterIpc(): void {
  ipcMain.handle('cutter:cut', async (_event, designData: string) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('cutter_port') as { value: string } | undefined;
    return cutDesign(designData, row?.value || '');
  });

  ipcMain.handle('cutter:status', () => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('cutter_port') as { value: string } | undefined;
    return getCutterStatus(row?.value || '');
  });
}
