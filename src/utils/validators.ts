import { allowedCurrencies } from '../config/index.js';

export function validateArgsLength(args: string[], minLength: number, command: string = 'CREATE') {
  if (args.length < minLength) {
    throw new Error(`Insufficient arguments for ${command} command, one or more arguments is missing.`);
  }
}

export function validateRequired(value: string | undefined, field: string, command: string = 'CREATE') {
  if (!value) throw new Error(`${field} is required for ${command} command`);
}

export function validateAmount(amountStr: string) {
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number for CREATE command");
  }
  return amount;
}

export function validateCurrency(currency: string) {
  if (!allowedCurrencies.includes(currency)) {
    throw new Error(`Currency "${currency}" is not supported. Allowed currencies: ${allowedCurrencies.join(", ")}`);
  }
}