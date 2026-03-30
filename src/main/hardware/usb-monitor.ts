import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif'];

export async function getRemovableDrives(): Promise<string[]> {
  try {
    // Use WMIC on Windows to list removable drives
    const { stdout } = await execPromise('wmic logicaldisk where "drivetype=2" get deviceid');
    const lines = stdout.split('\n').map(line => line.trim()).filter(line => line && line !== 'DeviceID');
    return lines;
  } catch (error) {
    console.error('Failed to get removable drives:', error);
    return [];
  }
}

export function listImagesOnDrive(drivePath: string): { path: string; name: string; size: number }[] {
  const results: { path: string; name: string; size: number }[] = [];

  function walk(dir: string, depth: number) {
    if (depth > 3) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (IMAGE_EXTENSIONS.includes(ext)) {
            try {
              const stat = fs.statSync(fullPath);
              results.push({ path: fullPath, name: entry.name, size: stat.size });
            } catch {
              // Skip files we can't stat
            }
          }
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  walk(drivePath, 0);
  return results;
}
