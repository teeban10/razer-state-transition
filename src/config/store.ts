import type { Payment } from '../types/index.js';

export const payments = new Map<string, Payment>();

export const getPayment = (id: string): Payment | null => {
  const payment = payments.get(id);
  return payment || null;
}

export const upsertPayment = (paymentId: string, paymentData: Payment): void => {
  payments.set(paymentId, paymentData);
}

export const getAllPayments = (): Payment[] => {
  return Array.from(payments.values());
}