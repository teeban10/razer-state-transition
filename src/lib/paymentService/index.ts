import { getPayment, upsertPayment } from '../../config/store.js';
import { PaymentState, type Payment } from '../../types/index.js';
import { roundToTwo } from '../../utils/index.js';
import { validateAmount, validateArgsLength, validateCurrency, validateRequired } from '../../utils/validators.js';

export const createPayment = (args: string[], command: string, comment?: string) => {
  validateArgsLength(args, 4);
  validateRequired(args[0], "Payment ID");
  const paymentId = args[0] as string;

  validateRequired(args[1], "Amount");
  const amount = validateAmount(args[1] as string);
  const amountRounded = parseFloat(amount.toFixed(2));
  const amountCents = Math.round(amountRounded * 100);
  if (paymentId === 'P1016') {
    console.log(amountRounded, amountCents, 'HOLA');
  }
  validateRequired(args[2], "Currency");
  validateCurrency(args[2] as string);
  const currency = args[2] as string;

  validateRequired(args[3], "Merchant ID");
  const merchantID = args[3] as string;
  const existingPayment = getPayment(paymentId);
  if (existingPayment) {
    // Idempotency check: if all details match, do nothing
    if (existingPayment.merchantId === merchantID && 
      existingPayment.amount_cents === amountCents && 
      existingPayment.currency === currency) {
      return;
    } else {
      const { state, ...rest } = existingPayment
      upsertPayment(paymentId, {
        ...rest,
        state: PaymentState.FAILED,
      })
      throw new Error(`Payment with ID "${paymentId}" already exists with different details. Marked as FAILED due to conflict.`);
    }
  }
  // Create new payment
  const newPayment: Payment = {
    id: paymentId,
    amount: amountRounded.toFixed(2),
    amount_cents: amountCents,
    currency,
    merchantId: merchantID,
    state: PaymentState.INITIATED,
  };
  upsertPayment(paymentId, newPayment);
  console.log(`Payment with ID: ${paymentId} has been created.`);
}