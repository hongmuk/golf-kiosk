import { app, BrowserWindow } from 'electron';
import path from 'path';
import { getDb, closeDb } from './database/connection';
import { runMigrations } from './database/migrations';
import { seedDefaults } from './database/seed';
import { registerDbIpc } from './ipc/db';
import { registerSettingsIpc } from './ipc/settings';
import { registerUsbIpc } from './ipc/usb';
import { registerPrinterIpc } from './ipc/printer';
import { registerPaymentIpc } from './ipc/payment';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Initialize database
  const db = getDb();
  runMigrations(db);
  seedDefaults(db);

  // Register IPC handlers
  registerDbIpc();
  registerSettingsIpc();
  registerUsbIpc();
  registerPrinterIpc();
  registerPaymentIpc();

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    fullscreen: false,
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  closeDb();
  app.quit();
});
