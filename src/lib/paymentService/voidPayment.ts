import {
  getPayment,
  upsertPayment,
} from '../../config/store.js'
import { PaymentState } from '../../types/index.js'
import {
  validateArgsLength,
  validateRequired,
} from '../../utils/validators.js'

export default function voidPayment(args: string[], command: string, comment?: string) {
  validateArgsLength(args, 2, command)
  validateRequired(args[0], 'Payment ID', command)
  const paymentId = args[0] as string
  validateRequired(args[1], 'Reason Code', command)
  const reasonCode = args[1] as string
  const payment = getPayment(paymentId)
  if (!payment) {
    throw new Error(
      `Payment with ID "${paymentId}" does not exist.`
    )
  }
  const allowedStates = [
    'INITIATED',
    'AUTHORIZED',
    'PRE_SETTLEMENT_REVIEW',
  ]
  if (!allowedStates.includes(payment.state)) {
    throw new Error(
      `Payment with ID "${paymentId}" is not in a state that can be voided. Current state: ${payment.state}`
    )
  }
  const { state, ...rest } = payment
  const newState = PaymentState.VOIDED

  upsertPayment(paymentId, {
    ...rest,
    state: newState,
    reasonCode
  })
  console.log(`Payment with ID: ${paymentId} has been voided due to ${reasonCode}.`);

}
