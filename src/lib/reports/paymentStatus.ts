import { table } from 'console';
import { payments } from '../../config/store.js';
import { validateArgsLength, validateRequired } from '../../utils/validators.js'

export default function paymentStatus(args: string[], command: string, comment?: string) {
  validateArgsLength(args, 1)
  validateRequired(args[0], 'Payment ID', command)
  const paymentId = args[0] as string
  console.log(`Fetching status for Payment ID ${paymentId}...`);
  const payment = payments.get(paymentId);
  if (!payment) {
    console.log(`Payment ID ${paymentId} not found.`);
    return;
  }
  console.table([payment]);
}