export async function cutDesign(designData: string, port: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[Cutter] Cutting on port ${port}, data size: ${designData.length}`);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 2000);
  });
}

export function getCutterStatus(port: string): { connected: boolean; status: string } {
  return { connected: port !== '', status: port ? 'ready' : 'not_configured' };
}
