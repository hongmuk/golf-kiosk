import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import { getDb, closeDb } from './database/connection';
import { runMigrations } from './database/migrations';
import { seedDefaults } from './database/seed';
import { registerDbIpc } from './ipc/db';
import { registerSettingsIpc } from './ipc/settings';
import { registerUsbIpc } from './ipc/usb';
import { registerPrinterIpc } from './ipc/printer';
import { registerPaymentIpc } from './ipc/payment';
import { registerCutterIpc } from './ipc/cutter';
import { getPrinterStatus } from './hardware/printer';
import { getCutterStatus } from './hardware/cutter';

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const db = getDb();
  runMigrations(db);
  seedDefaults(db);

  registerDbIpc();
  registerSettingsIpc();
  registerUsbIpc();
  registerPrinterIpc();
  registerPaymentIpc();
  registerCutterIpc();

  ipcMain.handle('hardware:status', () => {
    const db = getDb();
    const printerName = (db.prepare('SELECT value FROM settings WHERE key = ?').get('printer_name') as any)?.value || '';
    const cutterPort = (db.prepare('SELECT value FROM settings WHERE key = ?').get('cutter_port') as any)?.value || '';
    return {
      printer: getPrinterStatus(printerName).connected,
      payment: true,
      cutter: getCutterStatus(cutterPort).connected,
    };
  });

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: isDev,
    fullscreen: !isDev,
    kiosk: !isDev,
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Kiosk mode: prevent window close in production
  if (!isDev) {
    mainWindow.on('close', (e) => {
      e.preventDefault();
    });

    // Admin shutdown shortcut: Ctrl+Shift+Q
    globalShortcut.register('Ctrl+Shift+Q', () => {
      mainWindow?.destroy();
      app.quit();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Auto-start at Windows boot in production
  if (!isDev) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe'),
    });
  }
});

app.on('window-all-closed', () => {
  closeDb();
  app.quit();
});
