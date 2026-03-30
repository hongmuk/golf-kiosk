export interface PrintResult {
  success: boolean;
  error?: string;
}

export async function printImage(imageDataUrl: string, printerName: string): Promise<PrintResult> {
  console.log(`[Printer] Printing to "${printerName}", image size: ${imageDataUrl.length} bytes`);
  return new Promise((resolve) => {
    setTimeout(() => { resolve({ success: true }); }, 3000);
  });
}

export function getPrinterStatus(printerName: string): { connected: boolean; status: string } {
  return { connected: printerName !== '', status: printerName ? 'ready' : 'not_configured' };
}
