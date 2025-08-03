import {
    boolean,
    decimal,
    doublePrecision,
    foreignKey,
    index,
    integer,
    jsonb,
    pgTable,
    serial,
    text,
    timestamp,
    unique,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/pg-core'

import { nanoid } from '../../utils/nanoid'
import { sessionStatusEnum } from './enums'

export const Operator = pgTable('operators', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    name: text('name').notNull().unique(),
    operatorSecret: text('operator_secret').notNull(),
    operatorAccess: text('operator_access').notNull(),
    callbackUrl: text('callback_url').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    allowedIps: text('allowed_ips').array().notNull(),
    description: text('description'),
    balance: integer('balance').notNull(),
    netRevenue: integer('net-revenue').notNull(),
    acceptedPayments: text('accepted_payments').array().notNull(),
    ownerId: text('owner_id'),
    lastUsedAt: timestamp('last_used_at', { precision: 3 }),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow(),
})

export const User = pgTable('users', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    username: text('username').notNull().unique(),
    email: text('email').unique(),
    passwordHash: text('password_hash'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
        precision: 3,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
        precision: 3,
    }),
    currentGameSessionDataId: text('current_game_session_data_id').unique(),
    currentAuthSessionDataId: text('current_auth_session_data_id').unique(),
    avatar: text('avatar_url').default('avatar-01'),
    role: text('role').notNull().default('USER'),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { precision: 3 }),
    lastSeen: timestamp('last_login_at', { precision: 3 }),
    totalXpGained: integer('total_xp_gained').notNull(),
    activeWalletId: text('active_wallet_id').unique(),
    vipInfoId: text('vip_info_id').unique(),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { precision: 3 }),
})

export const Wallet = pgTable('wallets', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    balance: integer('balance').notNull(),
    paymentMethod: text('payment_method').notNull().default('INSTORE_CASH'),
    currency: text('currency').notNull().default('USD'),
    isActive: boolean('is_active').notNull().default(true),
    isDefault: boolean('is_default').notNull(),
    address: text('address').unique(),
    cashtag: text('cashtag').unique(),
    userId: text('user_id')
        .notNull()
        .references(() => User.id, { onDelete: 'cascade' }),
    operatorId: text('operator_id').notNull(),
    lastUsedAt: timestamp('last_used_at', { precision: 3 }),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow(),
})

export const AuthSession = pgTable(
    'auth_sessions',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        userId: text('user_id')
            .notNull()
            .references(() => User.id, { onDelete: 'cascade' }),
        status: sessionStatusEnum('status').default('ACTIVE').notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        deviceId: text('device_id'),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        expiresAt: timestamp('expires_at', { withTimezone: true }),
        lastSeen: timestamp('last_seen', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => {
        return {
            userIdx: index('auth_session_user_idx').on(
                table.userId,
                table.createdAt
            ),
            statusIdx: index('auth_session_status_idx').on(table.status),
        }
    }
)

export const GameSession = pgTable(
    'game_sessions',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        authSessionId: text('auth_session_id')
            .notNull()
            .references(() => AuthSession.id, { onDelete: 'cascade' }),
        userId: text('user_id')
            .notNull()
            .references(() => User.id, { onDelete: 'cascade' }),
        gameId: text('game_id'),
        status: sessionStatusEnum('status').default('ACTIVE').notNull(),
        totalWagered: integer('total_wagered').default(0).notNull(),
        totalWon: integer('total_won').default(0).notNull(),
        totalXpGained: integer('total_xp_gained').default(0).notNull(),
        rtp: decimal('rtp', { precision: 5, scale: 2 }),
        duration: integer('duration').default(0).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        endedAt: timestamp('end_at', { withTimezone: true }),
    },
    (table) => {
        return {
            authSessionIdx: index('game_session_auth_session_idx').on(
                table.authSessionId
            ),
            userIdx: index('game_session_user_idx').on(table.userId),
        }
    }
)

export const VipRank = pgTable('VipRank', {
    id: integer('id').notNull().primaryKey(),
    name: text('name').notNull().unique(),
    minXp: integer('minXp').notNull().unique(),
    dailyBonusCoinPct: integer('dailyBonusCoinPct').notNull(),
    hourlyBonusCoinPct: integer('hourlyBonusCoinPct').notNull(),
    purchaseBonusCoinPct: integer('purchaseBonusCoinPct').notNull(),
    levelUpBonusCoinPct: integer('levelUpBonusCoinPct').notNull(),
    hasConcierge: boolean('hasConcierge').notNull(),
    hasVipLoungeAccess: boolean('hasVipLoungeAccess').notNull(),
    isInvitationOnly: boolean('isInvitationOnly').notNull(),
})

export const VipInfo = pgTable(
    'vip_info',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        level: integer('level').notNull().default(1),
        xp: integer('xp').notNull(),
        totalXp: integer('totalXp').notNull(),
        userId: text('userId').notNull().unique(),
        currentRankid: integer('currentRankid'),
        createdAt: timestamp('created_at', { precision: 3 })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { precision: 3 })
            .notNull()
            .defaultNow(),
    },
    (VipInfo) => ({
        vip_info_user_fkey: foreignKey({
            name: 'vip_info_user_fkey',
            columns: [VipInfo.userId],
            foreignColumns: [User.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
        vip_info_currentRank_fkey: foreignKey({
            name: 'vip_info_currentRank_fkey',
            columns: [VipInfo.currentRankid],
            foreignColumns: [VipRank.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
    })
)

export const TournamentParticipant = pgTable('tournament_participants', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    tournamentId: text('tournament_id').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => User.id, { onDelete: 'cascade' }),
    score: integer('score').notNull(),
    rank: integer('rank'),
    joinedAt: timestamp('joined_at', { precision: 3 }).notNull().defaultNow(),
})

export const Game = pgTable(
    'games',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        name: text('name').notNull(),
        title: text('title').notNull(),
        goldsvetData: jsonb('goldsvet_data'),
        description: text('description'),
        category: text('category').notNull(),
        tags: text('tags').array().notNull(),
        thumbnailUrl: text('thumbnail_url'),
        bannerUrl: text('banner_url'),
        developer: text('provider_name').notNull(),
        providerId: text('provider_id'),
        totalWagered: integer('total_wagered').notNull(),
        totalWon: integer('total_won').notNull(),
        targetRtp: integer('target_rtp'),
        isFeatured: boolean('is_featured').notNull(),
        isActive: boolean('is_active').notNull().default(true),
        operatorId: text('operator_id'),
        tournamentDirectives: jsonb('tournament_directives'),
        createdAt: timestamp('created_at', { precision: 3 })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { precision: 3 })
            .notNull()
            .defaultNow(),
    },
    (Game) => ({
        games_operator_fkey: foreignKey({
            name: 'games_operator_fkey',
            columns: [Game.operatorId],
            foreignColumns: [Operator.id],
        })
            .onDelete('set null')
            .onUpdate('cascade'),
    })
)

export const FavoriteGame = pgTable('favorite_games', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    userId: text('user_id')
        .notNull()
        .references(() => User.id, { onDelete: 'cascade' }),
    gameId: text('game_id')
        .notNull()
        .references(() => Game.id, { onDelete: 'cascade' }),
})

export const GameSpin = pgTable('game_spins', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    playerName: text('player_name'),
    gameName: text('game_name'),
    gameId: text('game_id'),
    spinData: jsonb('spin_data'),
    grossWinAmount: doublePrecision('gross_win_amount').notNull(),
    wagerAmount: doublePrecision('wager_amount').notNull(),
    spinNumber: integer('spin_number').notNull(),
    playerAvatar: text('player_avatar'),
    currencyId: text('currency_id'),
    sessionId: text('session_id').notNull(),
    userId: text('user_id'),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow(),
    occurredAt: timestamp('occurred_at', { precision: 3 }).notNull(),
    sessionDataId: text('sessionDataId'),
})

export const GameHistory = pgTable('game_history', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    userId: text('user_id')
        .notNull()
        .references(() => User.id, { onDelete: 'cascade' }),
    gameId: text('game_id')
        .notNull()
        .references(() => Game.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
})

export const InActiveWallet = pgTable('in_active_wallets', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    balance: integer('balance').notNull(),
    paymentMethod: text('payment_method').notNull().default('INSTORE_CASH'),
    currency: text('currency').notNull().default('USD'),
    isActive: boolean('is_active').notNull(),
    isDefault: boolean('is_default').notNull(),
    address: text('address').unique(),
    cashtag: text('cashtag').unique(),
    userId: text('user_id'),
    operatorId: text('operator_id').notNull(),
    lastUsedAt: timestamp('last_used_at', { precision: 3 }),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow(),
})

export const Jackpot = pgTable(
    'jackpots',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        type: text('type').notNull(),
        currentAmountCoins: integer('current_amount_coins').notNull(),
        seedAmountCoins: integer('seed_amount_coins').notNull(),
        minimumBetCoins: integer('minimum_bet_coins').notNull().default(1),
        contributionRateBasisPoints: integer(
            'contribution_rate_basis_points'
        ).notNull(),
        probabilityPerMillion: integer('probability_per_million').notNull(),
        minimumTimeBetweenWinsMinutes: integer(
            'minimum_time_between_wins_minutes'
        ).notNull(),
        lastWonAt: timestamp('last_won_at', { precision: 3 }),
        lastWonBy: text('last_won_by'),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at', { precision: 3 })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { precision: 3 })
            .notNull()
            .defaultNow(),
    },
    (Jackpot) => ({
        jackpots_lastWinner_fkey: foreignKey({
            name: 'jackpots_lastWinner_fkey',
            columns: [Jackpot.lastWonBy],
            foreignColumns: [User.id],
        })
            .onDelete('set null')
            .onUpdate('cascade'),
    })
)

export const JackpotWin = pgTable(
    'jackpot_wins',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        jackpotId: text('jackpot_id').notNull(),
        winnerId: text('winner_id').notNull(),
        winAmountCoins: integer('win_amount_coins').notNull(),
        gameSpinId: text('game_spin_id').notNull().unique(),
        transactionId: text('transaction_id'),
        createdAt: timestamp('created_at', { precision: 3 })
            .notNull()
            .defaultNow(),
        sessionDataId: text('session_data_id'),
    },
    (JackpotWin) => ({
        jackpot_wins_gameSpin_fkey: foreignKey({
            name: 'jackpot_wins_gameSpin_fkey',
            columns: [JackpotWin.gameSpinId],
            foreignColumns: [GameSpin.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
        jackpot_wins_jackpot_fkey: foreignKey({
            name: 'jackpot_wins_jackpot_fkey',
            columns: [JackpotWin.jackpotId],
            foreignColumns: [Jackpot.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
        jackpot_wins_winner_fkey: foreignKey({
            name: 'jackpot_wins_winner_fkey',
            columns: [JackpotWin.winnerId],
            foreignColumns: [User.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
    })
)

export const VipLevel = pgTable('VipLevel', {
    level: integer('level').notNull().primaryKey(),
    xpForNext: integer('xpForNext').notNull(),
})

export const VipLevelUpHistory = pgTable(
    'vip_level_up_history',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        previousLevel: integer('previous_level').notNull(),
        newLevel: integer('new_level').notNull(),
        timestamp: timestamp('timestamp', { precision: 3 })
            .notNull()
            .defaultNow(),
        vipInfoId: text('vip_info_id').notNull(),
    },
    (VipLevelUpHistory) => ({
        vip_level_up_history_vipInfo_fkey: foreignKey({
            name: 'vip_level_up_history_vipInfo_fkey',
            columns: [VipLevelUpHistory.vipInfoId],
            foreignColumns: [VipInfo.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
    })
)

export const Product = pgTable(
    'products',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        title: text('title').notNull().default('default'),
        productType: text('product_type').notNull().default('bundle'),
        bonusTotalInCents: integer('bonus_total_in_credits').notNull(),
        isActive: boolean('is_active'),
        priceInCents: integer('price_in_cents').notNull(),
        amountToReceiveInCents: integer(
            'amount_to_receive_in_credits'
        ).notNull(),
        bestValue: integer('best_value').notNull(),
        discountInCents: integer('discount_in_cents').notNull(),
        bonusSpins: integer('bonus_spins').notNull(),
        isPromo: boolean('is_promo'),
        totalDiscountInCents: integer('total_discount_in_cents').notNull(),
        operatorId: text('operator_id'),
        createdAt: timestamp('created_at', { precision: 3 })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { precision: 3 })
            .notNull()
            .defaultNow(),
    },
    (Product) => ({
        products_operator_fkey: foreignKey({
            name: 'products_operator_fkey',
            columns: [Product.operatorId],
            foreignColumns: [Operator.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
    })
)

export const Transaction = pgTable(
    'transactions',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        processedAt: timestamp('processed_at', { precision: 3 }),
        walletId: text('wallet_id'),
        type: text('type').notNull(),
        status: text('status').notNull().default('PENDING'),
        amount: integer('amount').notNull(),
        netAmount: integer('net_amount'),
        feeAmount: integer('fee_amount'),
        productId: text('product_id'),
        paymentMethod: text('payment_method'),
        balanceBefore: integer('balance_before'),
        balanceAfter: integer('balance_after'),
        bonusBalanceBefore: integer('bonus_balance_before'),
        bonusBalanceAfter: integer('bonus_balance_after'),
        bonusAmount: integer('bonus_amount'),
        wageringRequirement: integer('wagering_requirement'),
        wageringProgress: integer('wagering_progress'),
        description: text('description'),
        provider: text('provider'),
        providerTxId: text('provider_tx_id'),
        relatedGameId: text('related_game_id'),
        relatedRoundId: text('related_round_id'),
        createdAt: timestamp('created_at', { precision: 3 })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { precision: 3 })
            .notNull()
            .defaultNow(),
        operatorId: text('operator_id'),
        userId: text('user_id'),
    },
    (Transaction) => ({
        transactions_product_fkey: foreignKey({
            name: 'transactions_product_fkey',
            columns: [Transaction.productId],
            foreignColumns: [Product.id],
        })
            .onDelete('set null')
            .onUpdate('cascade'),
        transactions_wallet_fkey: foreignKey({
            name: 'transactions_wallet_fkey',
            columns: [Transaction.walletId],
            foreignColumns: [Wallet.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
    })
)

export const JackpotContribution = pgTable(
    'jackpot_contributions',
    {
        id: varchar('id').primaryKey().$defaultFn(nanoid),
        jackpotId: text('jackpot_id').notNull(),
        userId: text('user_id'),
        gameSpinId: text('game_spin_id').notNull(),
        contributionAmountCoins: integer('contribution_amount_coins').notNull(),
        createdAt: timestamp('created_at', { precision: 3 })
            .notNull()
            .defaultNow(),
    },
    (JackpotContribution) => ({
        jackpot_contributions_gameSpin_fkey: foreignKey({
            name: 'jackpot_contributions_gameSpin_fkey',
            columns: [JackpotContribution.gameSpinId],
            foreignColumns: [GameSpin.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
        jackpot_contributions_jackpot_fkey: foreignKey({
            name: 'jackpot_contributions_jackpot_fkey',
            columns: [JackpotContribution.jackpotId],
            foreignColumns: [Jackpot.id],
        })
            .onDelete('cascade')
            .onUpdate('cascade'),
        JackpotContribution_jackpotId_gameSpinId_unique_idx: uniqueIndex(
            'JackpotContribution_jackpotId_gameSpinId_key'
        ).on(JackpotContribution.jackpotId, JackpotContribution.gameSpinId),
    })
)

export const tasks = pgTable('tasks', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    name: text('name').notNull(),
    done: boolean('done').notNull().default(false),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()),
    updatedAt: timestamp('updated_at')
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
})

export const appVersions = pgTable(
    'app_versions',
    {
        id: serial('id').primaryKey(),
        appId: text('app_id').notNull(),
        version: text('version').notNull(),
        platform: text('platform').notNull(),
        updateType: text('update_type').notNull(),
        downloadUrl: text('download_url').notNull(),
        changelog: text('changelog').array().notNull(),
        mandatory: boolean('mandatory').default(false).notNull(),
        releaseDate: timestamp('release_date', {
            withTimezone: true,
        }).notNull(),
        fileSize: integer('file_size').notNull(),
        checksum: text('checksum').notNull(),
    },
    (table) => {
        return {
            versionUnique: unique('version_unique_idx').on(
                table.appId,
                table.platform,
                table.version
            ),
        }
    }
)
