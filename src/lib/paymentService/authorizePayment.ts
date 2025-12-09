import {
  getPayment,
  upsertPayment,
} from '../../config/store.js'
import { PaymentState } from '../../types/index.js'
import {
  validateArgsLength,
  validateRequired,
} from '../../utils/validators.js'

export default function authorizePayment(args: string[], command: string, comment?: string) {
  validateArgsLength(args, 1, command)
  validateRequired(args[0], 'Payment ID', command)
  const paymentId = args[0] as string
  const payment = getPayment(paymentId)
  if (!payment) {
    throw new Error(
      `Payment with ID "${paymentId}" does not exist.`
    )
  }
  if (payment.state !== 'INITIATED') {
    throw new Error(
      `Payment with ID "${paymentId}" is not in a state that can be authorized. Current state: ${payment.state}`
    )
  }
  const { state, ...rest } = payment
  /**
   * Business rule: Payments >= 100 go to PRE_SETTLEMENT_REVIEW for 
   * possible fraud checks.
   *  */
  const newState =
    payment.amount_cents >= 10000
      ? PaymentState.PRE_SETTLEMENT_REVIEW
      : PaymentState.AUTHORIZED

  upsertPayment(paymentId, {
    ...rest,
    state: newState,
  })
  console.log(`Payment with ID: ${paymentId} has been authorized.`);
}
