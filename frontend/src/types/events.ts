// PATH: frontend/src/types/events.ts
import { User, Wallet, VipInfo } from '@/sdk/generated'
import { Operator } from '@/sdk/generated/operator.gen'

/**
 * Defines the payload structure for the 'balance:update' event.
 */
export interface BalanceUpdatePayload {
  amount: number
}
export type ModelChangeEventFromServer = {
  type: string
  action: string
  data: Record<string, number>[] | Partial<User> | Partial<Operator> | Partial<Wallet> | Partial<VipInfo> 
}
export type AnimationEventFromServer = {
  type: string
  action: string
  data: Record<string, number>[] 
}
