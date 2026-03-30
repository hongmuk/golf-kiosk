import { ipcMain, BrowserWindow } from 'electron';
import { requestPayment, cancelPayment } from '../hardware/payment';

export function registerPaymentIpc(): void {
  ipcMain.handle('payment:request', async (_event, amount: number) => {
    const result = await requestPayment(amount);
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('payment:result', result);
    return result;
  });

  ipcMain.handle('payment:cancel', async (_event, transactionId: string) => {
    return cancelPayment(transactionId);
  });
}
