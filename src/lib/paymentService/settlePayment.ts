import {
  getPayment,
  upsertPayment,
} from '../../config/store.js'
import { PaymentState } from '../../types/index.js'
import {
  validateArgsLength,
  validateRequired,
} from '../../utils/validators.js'

export default function settlePayment(args: string[], command: string, comment?: string) {
  validateArgsLength(args, 1, command)
  validateRequired(args[0], 'Payment ID', command)
  const paymentId = args[0] as string
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
  if (!allowedStates.includes(payment.state)) {
    throw new Error(
      `Payment with ID "${paymentId}" is not in a state that can be Settled. Current state: ${payment.state}`
    )
  }
  if (payment.state !== PaymentState.SETTLED) {
    const { state, ...rest } = payment
    const newState = PaymentState.SETTLED
    upsertPayment(paymentId, {
      ...rest,
      state: newState,
    })
  }
  console.log(`Payment with ID: ${paymentId} has been Settled.`);
}
