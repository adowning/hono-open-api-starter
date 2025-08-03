import { pgEnum } from 'drizzle-orm/pg-core'

export const GameCategory = pgEnum('game_categories', ['slots', 'fish', 'table', 'live', 'poker', 'lottery', 'virtual', 'other'])
export const TournamentStatus = pgEnum('TournamentStatus', ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
export const UserRole = pgEnum('UserRole', ['USER', 'ADMIN', 'MODERATOR', 'SUPPORT', 'BOT', 'SYSTEM'])
export const SessionStatus = pgEnum('SessionStatus', ['ACTIVE', 'COMPLETED', 'ABANDONED', 'TIMEOUT'])
export const TypeOfJackpot = pgEnum('TypeOfJackpot', ['MINOR', 'MAJOR', 'GRAND'])
export const PaymentMethod = pgEnum('PaymentMethod', ['INSTORE_CASH', 'INSTORE_CARD', 'CASH_APP'])
export const TypeOfTransaction = pgEnum('TypeOfTransaction', ['DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'TRANSFER_SENT', 'TRANSFER_RECEIVED', 'SYSTEM_ADJUSTMENT_CREDIT', 'SYSTEM_ADJUSTMENT_DEBIT', 'TOURNAMENT_BUYIN', 'TOURNAMENT_PRIZE', 'AFFILIATE_COMMISSION', 'REFUND', 'FEE', 'BONUS_AWARD', 'BET_PLACE', 'BET_WIN', 'BET_LOSE', 'BET_REFUND', 'BONUS_WAGER', 'BONUS_CONVERT', 'BONUS_EXPIRED', 'XP_AWARD', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'INTERNAL_TRANSFER', 'PRODUCT_PURCHASE', 'REBATE_PAYOUT', 'JACKPOT_WIN', 'JACKPOT_CONTRIBUTION'])
export const TransactionStatus = pgEnum('TransactionStatus', ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED', 'REJECTED', 'REQUIRES_ACTION', 'ON_HOLD'])
export const Role = pgEnum('Role', ['USER', 'ADMIN', 'VIP', 'MODERATOR', 'SYSTEM', 'OWNER', 'MEMBER', 'OPERATOR', 'SUPPORT_AGENT'])
export const GameProviderName = pgEnum('GameProviderName', ['pragmaticplay', 'evoplay', 'netent', 'playngo', 'relaxgaming', 'hacksaw', 'bgaming', 'spribe', 'internal', 'redtiger', 'netgame', 'bigfishgames', 'cqnine', 'nolimit', 'kickass'])
export const Permission = pgEnum('Permission', ['read', 'write', 'upload', 'manage_users', 'manage_settings', 'launch_game'])
export const UpdateType = pgEnum('UpdateType', ['BINARY', 'OTA'])
export const sessionStatusEnum = pgEnum('session_status', [
    'ACTIVE',
    'COMPLETED',
    'EXPIRED',
])
export const updateTypeEnum = pgEnum('update_type', ['BINARY', 'OTA'])
