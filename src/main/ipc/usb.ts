import { ipcMain } from 'electron';
import fs from 'fs';
import { getRemovableDrives, listImagesOnDrive } from '../hardware/usb-monitor';

export function registerUsbIpc(): void {
  ipcMain.handle('usb:list-images', async () => {
    const drives = await getRemovableDrives();
    const allImages: { path: string; name: string; size: number }[] = [];
    for (const drive of drives) {
      allImages.push(...listImagesOnDrive(drive));
    }
    return allImages;
  });

  ipcMain.handle('usb:read-image', async (_event, filePath: string) => {
    const data = fs.readFileSync(filePath);
    const ext = filePath.split('.').pop()?.toLowerCase() || 'png';
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${data.toString('base64')}`;
  });
}
