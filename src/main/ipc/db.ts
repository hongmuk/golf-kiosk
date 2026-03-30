import { ipcMain } from 'electron';
import { getDb } from '../database/connection';

export function registerDbIpc(): void {
  ipcMain.handle('db:query', (_event, sql: string, params: unknown[] = []) => {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  });

  ipcMain.handle('db:execute', (_event, sql: string, params: unknown[] = []) => {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  });
}
