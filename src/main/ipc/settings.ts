import { ipcMain } from 'electron';
import { getDb } from '../database/connection';

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', (_event, key: string) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value ?? null;
  });

  ipcMain.handle('settings:get-all', () => {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  });

  ipcMain.handle('settings:set', (_event, key: string, value: string) => {
    const db = getDb();
    db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now','localtime'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).run(key, value);
    return true;
  });
}
