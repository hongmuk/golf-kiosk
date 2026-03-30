export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  approvalNo?: string;
  error?: string;
}

export async function requestPayment(amount: number): Promise<PaymentResult> {
  console.log(`[Payment] Requesting KICC payment: ${amount}원`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const txId = `TX${Date.now()}`;
      const approvalNo = `AP${Math.floor(Math.random() * 900000 + 100000)}`;
      resolve({ success: true, transactionId: txId, approvalNo });
    }, 3000);
  });
}

export async function cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[Payment] Cancelling: ${transactionId}`);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 1500);
  });
}
