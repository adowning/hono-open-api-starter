// PATH: frontend/src/types/events.ts
import { User, Operator, Wallet, VipInfo } from '@/sdk/generated'

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
