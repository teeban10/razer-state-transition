import { getAllPayments } from '../config/store.js';
import authorizePayment from './paymentService/authorizePayment.js';
import capturePayment from './paymentService/capturePayment.js';
import { createPayment } from './paymentService/index.js';
import refundPayment from './paymentService/refundPayment.js';
import settlePayment from './paymentService/settlePayment.js';
import voidPayment from './paymentService/voidPayment.js';
import paymentStatus from './reports/paymentStatus.js';
import settlement from './reports/settlement.js';
import { parseTokens } from './tokenParser.js';

export function handleCommand(line: string) {
  const parsedCommand = parseTokens(line);
  if (!parsedCommand) {
    return;
  }
  const { tokens, comment } = parsedCommand;
  const [command, ...args] = tokens;
  switch (command) {
    case "CREATE":
      return createPayment(args, command, comment);
    case "AUTHORIZE":
      return authorizePayment(args, command, comment);
    case "CAPTURE":
      return capturePayment(args, command, comment);
    case "VOID":
      return voidPayment(args, command, comment);
    case "REFUND":
      return refundPayment(args, command, comment);
    case "SETTLE":
      return settlePayment(args, command, comment);
    case "SETTLEMENT":
      return settlement(args, command, comment);
    case "STATUS":
      return paymentStatus(args, command, comment);
    case "LIST":
      const payments = getAllPayments();
      console.table(payments);
      return;
    case "AUDIT":
      console.log("AUDIT RECEIVED");
      return;
    // EXIT command is handled in index.ts, but just in case
    case "EXIT":
      console.log('Goodbye!');
      process.exit(0);
    default:
      throw new Error(`Unknown command: "${command}", Please enter a valid command.`);
  }
}