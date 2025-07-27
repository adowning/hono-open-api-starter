import type { User, Wallet, VipInfo } from '@/sdk/generated'

export type WebSocketMessage =
  | {
      type: 'user:update'
      payload: Partial<User>
    }
  | {
      type: 'wallet:update'
      payload: Partial<Wallet>
    }
  | {
      type: 'vip:update'
      payload: Partial<VipInfo>
    }
  | {
      type: 'xp:gain'
      payload: {amount: number}
    }
| {
      type: 'balance:gain'
      payload: {amount: number}
    }