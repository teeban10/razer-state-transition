export enum PaymentState {
  INITIATED = "INITIATED",
  AUTHORIZED = "AUTHORIZED",
  PRE_SETTLEMENT_REVIEW = "PRE_SETTLEMENT_REVIEW",
  CAPTURED = "CAPTURED",
  SETTLED = "SETTLED",
  VOIDED = "VOIDED",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED"
}

export interface Payment {
  id: string;
  amount: string;     // store as string or Decimal to avoid float errors
  amount_cents: number; // amount in cents for precision
  currency: string; 
  merchantId: string;
  state: PaymentState;
  // Optional metadata based on commands:
  reasonCode?: string;    // VOID
  refundedAmount?: string;
  refundedAmountCents?: number;
  createConflictReason?: string; // if marked FAILED due to CREATE conflict
}