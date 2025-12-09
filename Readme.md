# Razer Payment Processing System

A command-line payment processing system with state machine-based payment lifecycle management, supporting operations like authorization, capture, refund, and settlement.

## Architecture Overview

### Payment State Machine

The system manages payments through a defined state lifecycle:

```
INITIATED 
  ↓
  ├─→ AUTHORIZED (amount < $100)
  │     ↓
  │   CAPTURED
  │     ↓
  │   SETTLED
  │
  └─→ PRE_SETTLEMENT_REVIEW (amount ≥ $100)
        ↓
      AUTHORIZED
        ↓
      CAPTURED
        ↓
      SETTLED
```

## Core Features

### 1. Payment Creation (CREATE)

Creates a new payment with idempotency support.

**Command Format:**
```
CREATE <PaymentID> <Amount> <Currency> <MerchantID>
```

**Example:**
```
CREATE P1001 150.00 MYR M001
```

**Validations:**
- Payment ID must be unique (or match existing payment exactly)
- Amount must be positive number with max 2 decimal places
- Currency must be from allowed list (e.g., MYR, USD, SGD)
- Merchant ID is required

**Idempotency:** If payment already exists with identical details, the operation succeeds silently.

---

### 2. State Transition to PRE_SETTLEMENT_REVIEW

#### How It Works

When a payment is authorized, the system automatically routes high-value transactions to a review queue:

```typescript
const newState = payment.amount_cents >= 10000
  ? PaymentState.PRE_SETTLEMENT_REVIEW
  : PaymentState.AUTHORIZED
```

**Threshold:** $100 (10,000 cents)

#### Why PRE_SETTLEMENT_REVIEW?

1. **Fraud Detection:** Large transactions trigger automated review before settlement
2. **Risk Management:** Reduces financial exposure on high-value payments
3. **Compliance:** Aligns with PCI-DSS security requirements
4. **Manual Inspection:** Allows merchant to verify suspicious transactions

#### State Flow Details

- **Small Payments (< $100):** `INITIATED → AUTHORIZED → CAPTURED → SETTLED`
- **Large Payments (≥ $100):** `INITIATED → PRE_SETTLEMENT_REVIEW → AUTHORIZED → CAPTURED → SETTLED`

The `PRE_SETTLEMENT_REVIEW` state is transitional—once reviewed, the payment moves to `AUTHORIZED` status before proceeding to capture and settlement.

---

### 3. Payment Authorization (AUTHORIZE)

Moves payment from `INITIATED` to `AUTHORIZED` or `PRE_SETTLEMENT_REVIEW` state.

**Command Format:**
```
AUTHORIZE <PaymentID>
```

**Example:**
```
AUTHORIZE P1001
```

**State Requirements:**
- Payment must exist
- Payment must be in `INITIATED` state

**Automatic Routing:**
- Amounts < $100 → `AUTHORIZED` state
- Amounts ≥ $100 → `PRE_SETTLEMENT_REVIEW` state

---

### 4. Payment Capture (CAPTURE)

Captures an authorized payment, moving it to `CAPTURED` state.

**Command Format:**
```
CAPTURE <PaymentID>
```

**State Requirements:**
- Payment must be in `AUTHORIZED` state

---

### 5. Partial Refunds

Refunds partial or full amounts from captured/settled payments.

#### Validation Rules

**1. Payment Existence & State**
```typescript
const payment = getPayment(paymentId);
if (!payment) throw new Error("Payment does not exist");

if (payment.state !== PaymentState.CAPTURED && 
    payment.state !== PaymentState.SETTLED) {
  throw new Error("Cannot refund—payment not in refundable state");
}
```

**2. Refund Amount Constraints**

- **Must be positive:** `refundAmount > 0`
- **Cannot exceed captured:** `refundAmount ≤ payment.amount_cents`
- **Valid currency format:** Max 2 decimal places

**Example:**
```
Original Payment: $150.00
Valid Refund: $75.50 ✓
Invalid Refund: $150.01 ✗ (exceeds amount)
Invalid Refund: -$50.00 ✗ (negative)
```

**3. Idempotency Check**
- Same refund ID prevents duplicate refunds
- Protects against accidental double-processing
- Ensures payment consistency across retries

#### Refund Processing

```typescript
export const refundPayment = (args: string[]) => {
  validateArgsLength(args, 2);
  const paymentId = args[0];
  const refundAmount = validateAmount(args[1]);
  
  const payment = getPayment(paymentId);
  if (!payment) {
    throw new Error(`Payment "${paymentId}" does not exist`);
  }
  
  const allowedStates = [PaymentState.CAPTURED, PaymentState.SETTLED];
  if (!allowedStates.includes(payment.state)) {
    throw new Error(
      `Cannot refund payment in ${payment.state} state. ` +
      `Only ${allowedStates.join("/")} payments can be refunded.`
    );
  }
  
  const refundCents = Math.round(refundAmount * 100);
  if (refundCents > payment.amount_cents) {
    throw new Error(
      `Refund amount $${refundAmount} exceeds captured amount ` +
      `$${(payment.amount_cents / 100).toFixed(2)}`
    );
  }
  
  // Process refund
  upsertPayment(paymentId, {
    ...payment,
    state: PaymentState.REFUNDED,
  });
  
  console.log(
    `Refund of $${refundAmount} processed for Payment ${paymentId}`
  );
};
```

---

### 6. Payment Void (VOID)

Cancels a payment before capture. Once captured, use refund instead.

**Command Format:**
```
VOID <PaymentID>
```

**Valid States:** `INITIATED`, `AUTHORIZED`, `PRE_SETTLEMENT_REVIEW`

---

### 7. Payment Settlement (SETTLE)

Marks a captured payment as settled and transfers funds.

**Command Format:**
```
SETTLE <PaymentID> <SettlementType> <Confirmed>
```

**Example:**
```
SETTLE P1001 BATCH YES
```

---

### 8. Settlement Reports

View settlement batches and payment status reports.

**Commands:**
```
SETTLEMENT     # View settlement batch report
STATUS         # View all payment statuses
```

---

## Configuration

### Allowed Currencies

Configurable in `src/config/index.ts`:

```typescript
export const allowedCurrencies = ['MYR', 'USD', 'SGD', 'THB'];
```

### Amount Precision

All amounts are stored in two formats:
- **Decimal:** `amount` (string) - User-friendly format
- **Cents:** `amount_cents` (number) - Integer representation for accurate calculations

This prevents floating-point arithmetic errors.

---

## Error Handling

The system validates all inputs and enforces state machine rules:

- **Invalid State Transitions:** Rejects operations on payments in wrong states
- **Insufficient Arguments:** Validates required command parameters
- **Validation Errors:** Currency, amount, and ID validation
- **Idempotency Conflicts:** Detects and reports duplicate payment attempts

---

## Command Reference

| Command | Arguments | Description |
|---------|-----------|-------------|
| CREATE | PaymentID, Amount, Currency, MerchantID | Create new payment |
| AUTHORIZE | PaymentID | Authorize payment |
| CAPTURE | PaymentID | Capture authorized payment |
| VOID | PaymentID | Cancel payment |
| REFUND | PaymentID, Amount | Refund partial/full amount |
| SETTLE | PaymentID, Type, Confirmed | Mark as settled |
| SETTLEMENT | - | View settlement report |
| STATUS | - | View all payment statuses |
| LIST | - | List all payments |
| AUDIT | - | View audit log |
| EXIT | - | Exit CLI |

---

## Usage

Before running any of the command you must run 

```bash
pnpm build
```

### Interactive Mode
```bash
pnpm start
```

### Batch Processing
```bash
pnpm start commands.txt
```

### Testing
```bash
pnpm test
```

---

## Project Structure

```
src/
├── index.ts              # CLI entry point
├── lib/
│   ├── handleCommand.ts  # Command router
│   ├── tokenParser.ts    # Input parser
│   └── paymentService/   # Payment operations
│       ├── index.ts      # CREATE
│       ├── authorizePayment.ts
│       ├── capturePayment.ts
│       ├── refundPayment.ts
│       ├── voidPayment.ts
│       └── settlePayment.ts
├── config/               # Configuration & store
├── types/                # Type definitions
└── utils/                # Validators & helpers
```

---

## Design Principles

1. **State Machine Enforcement:** Payments follow strict state transitions
2. **Idempotency:** Safe retries without duplicate processing
3. **Validation First:** All inputs validated before processing
4. **Precision:** Amounts stored as integers (cents) to avoid float errors
5. **Audit Trail:** All operations logged for compliance

