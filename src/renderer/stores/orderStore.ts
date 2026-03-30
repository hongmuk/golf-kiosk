import { create } from 'zustand';

interface OrderState {
  orderId: number | null;
  productType: 'golf_ball' | 'sticker';
  amount: number;
  designDataJson: string;
  transactionId: string;
  approvalNo: string;
  setOrder: (data: Partial<OrderState>) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orderId: null,
  productType: 'golf_ball',
  amount: 0,
  designDataJson: '{}',
  transactionId: '',
  approvalNo: '',
  setOrder: (data) => set((s) => ({ ...s, ...data })),
  reset: () => set({
    orderId: null, productType: 'golf_ball', amount: 0,
    designDataJson: '{}', transactionId: '', approvalNo: '',
  }),
}));
