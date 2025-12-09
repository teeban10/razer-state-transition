import { payments } from '../../config/store.js';
import { PaymentState } from '../../types/index.js';
import { validateArgsLength, validateRequired } from '../../utils/validators.js';

export default function settlement(args: string[], command: string, comment?: string) {
  validateArgsLength(args, 1, command)
  validateRequired(args[0], 'Batch ID', command)
  const batchId = args[0] as string
  console.log(`Processing Batch ID ${batchId} for settlement...`);
  const settled = [];
  for (const p of payments.values()) if (p.state === PaymentState.SETTLED) settled.push(p);
  if (settled.length === 0) {
    console.log("No payments found for settlement in this batch.");
    return;
  }
  console.table(settled);
  console.log("Processed settlement report for Batch ID:", batchId);
  return;
}