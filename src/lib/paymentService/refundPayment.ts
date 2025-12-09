import {
  getPayment,
  upsertPayment,
} from '../../config/store.js'
import { PaymentState } from '../../types/index.js'
import { roundToTwo } from '../../utils/index.js'
import {
  validateAmount,
  validateArgsLength,
  validateRequired,
} from '../../utils/validators.js'

export default function refundPayment(args: string[], command: string, comment?: string) {
  validateArgsLength(args, 1, command)
  validateRequired(args[0], 'Payment ID', command)
  const paymentId = args[0] as string
  validateRequired(args[1], 'Amount', command)
  const refundAmount = validateAmount(args[1] as string)
  const refundAmountRounded = roundToTwo(refundAmount)
  const refundAmountCents = refundAmountRounded * 100
  const payment = getPayment(paymentId)
  if (!payment) {
    throw new Error(
      `Payment with ID "${paymentId}" does not exist.`
    )
  }
  const allowedStates = [
    PaymentState.CAPTURED,
    PaymentState.SETTLED,
  ]
  if (payment.state === PaymentState.REFUNDED) {
    throw new Error(
      `Payment with ID "${paymentId}" has already been refunded.`
    )
  }
  if (!allowedStates.includes(payment.state)) {
    throw new Error(
      `Payment with ID "${paymentId}" is not in a state that can be voided. Current state: ${payment.state}`
    )
  }
  // Check if refund amount exceeds original payment amount
  if (refundAmountCents > payment.amount_cents) {
    throw new Error(
      `Refund amount exceeds the original payment amount for Payment ID "${paymentId}".`
    )
  }
  const { state, ...rest } = payment
  const newState = PaymentState.REFUNDED

  upsertPayment(paymentId, {
    ...rest,
    state: newState,
    refundedAmount: refundAmountRounded.toFixed(2),
    refundedAmountCents: refundAmountCents,
  })
  console.log(
    `Payment with ID: ${paymentId} has been refunded ${refundAmountRounded.toFixed(
      2
    )} ${payment.currency}.`
  )
}
