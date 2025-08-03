/* eslint-disable ts/no-use-before-define */
import {
    pgTable,
    index,
    foreignKey,
    varchar,
    text,
    integer,
    numeric,
    timestamp,
    jsonb,
    doublePrecision,
    unique,
    boolean,
    serial,
    json,
    uniqueIndex,
    pgEnum,
} from 'drizzle-orm/pg-core'

export const gameProviderName = pgEnum('GameProviderName', [
    'pragmaticplay',
    'evoplay',
    'netent',
    'playngo',
    'relaxgaming',
    'hacksaw',
    'bgaming',
    'spribe',
    'internal',
    'redtiger',
    'netgame',
    'bigfishgames',
    'cqnine',
    'nolimit',
    'kickass',
])
export const paymentMethod = pgEnum('PaymentMethod', [
    'INSTORE_CASH',
    'INSTORE_CARD',
    'CASH_APP',
])
export const permission = pgEnum('Permission', [
    'read',
    'write',
    'upload',
    'manage_users',
    'manage_settings',
    'launch_game',
])
export const role = pgEnum('Role', [
    'USER',
    'ADMIN',
    'VIP',
    'MODERATOR',
    'SYSTEM',
    'OWNER',
    'MEMBER',
    'OPERATOR',
    'SUPPORT_AGENT',
])
export const tournamentStatus = pgEnum('TournamentStatus', [
    'PENDING',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
])
export const transactionStatus = pgEnum('TransactionStatus', [
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'EXPIRED',
    'REJECTED',
    'REQUIRES_ACTION',
    'ON_HOLD',
])
export const typeOfJackpot = pgEnum('TypeOfJackpot', [
    'MINOR',
    'MAJOR',
    'GRAND',
])
export const typeOfTransaction = pgEnum('TypeOfTransaction', [
    'DEPOSIT',
    'WITHDRAWAL',
    'BET',
    'WIN',
    'TRANSFER_SENT',
    'TRANSFER_RECEIVED',
    'SYSTEM_ADJUSTMENT_CREDIT',
    'SYSTEM_ADJUSTMENT_DEBIT',
    'TOURNAMENT_BUYIN',
    'TOURNAMENT_PRIZE',
    'AFFILIATE_COMMISSION',
    'REFUND',
    'FEE',
    'BONUS_AWARD',
    'BET_PLACE',
    'BET_WIN',
    'BET_LOSE',
    'BET_REFUND',
    'BONUS_WAGER',
    'BONUS_CONVERT',
    'BONUS_EXPIRED',
    'XP_AWARD',
    'ADJUSTMENT_ADD',
    'ADJUSTMENT_SUB',
    'INTERNAL_TRANSFER',
    'PRODUCT_PURCHASE',
    'REBATE_PAYOUT',
    'JACKPOT_WIN',
    'JACKPOT_CONTRIBUTION',
])
export const userRole = pgEnum('UserRole', [
    'USER',
    'ADMIN',
    'MODERATOR',
    'SUPPORT',
    'BOT',
    'SYSTEM',
])
export const gameCategories = pgEnum('game_categories', [
    'slots',
    'fish',
    'table',
    'live',
    'poker',
    'lottery',
    'virtual',
    'other',
])
export const messageType = pgEnum('message_type', [
    'update:wallet',
    'update:vip',
    'update:balance',
    'update:gameSession',
])
export const sessionStatus = pgEnum('session_status', [
    'ACTIVE',
    'COMPLETED',
    'EXPIRED',
    'ABANDONED',
    'TIMEOUT',
])
export const updateType = pgEnum('update_type', ['BINARY', 'OTA'])

export const gameSessions = pgTable(
    'game_sessions',
    {
        id: varchar().primaryKey().notNull(),
        authSessionId: text('auth_session_id').notNull(),
        userId: text('user_id').notNull(),
        gameId: text('game_id'),
        status: sessionStatus().default('ACTIVE').notNull(),
        totalWagered: integer('total_wagered').default(0).notNull(),
        totalWon: integer('total_won').default(0).notNull(),
        totalXpGained: integer('total_xp_gained').default(0).notNull(),
        rtp: numeric({ precision: 5, scale: 2 }),
        duration: integer().default(0).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        endAt: timestamp('end_at', { withTimezone: true, mode: 'string' }),
    },
    (table) => [
        index('game_session_auth_session_idx').using(
            'btree',
            table.authSessionId.asc().nullsLast().op('text_ops')
        ),
        index('game_session_user_idx').using(
            'btree',
            table.userId.asc().nullsLast().op('text_ops')
        ),
        foreignKey({
            columns: [table.authSessionId],
            foreignColumns: [authSessions.id],
            name: 'game_sessions_auth_session_id_auth_sessions_id_fk',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'game_sessions_user_id_users_id_fk',
        }).onDelete('cascade'),
    ]
)

export const blackjackGames = pgTable('blackjack_games', {
    id: varchar().primaryKey().notNull(),
    table: integer().notNull(),
    type: text().notNull(),
    state: text().notNull(),
    deck: jsonb(),
    dealerCards: jsonb('dealer_cards'),
    fair: jsonb(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
        .defaultNow()
        .notNull(),
})

export const blackjackMessage = pgTable('blackjack_message', {
    id: varchar().primaryKey().notNull(),
    event: text(),
    requestId: text('request_id'),
    payload: jsonb(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
        .defaultNow()
        .notNull(),
})

export const gameSpins = pgTable('game_spins', {
    id: varchar().primaryKey().notNull(),
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
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
        .defaultNow()
        .notNull(),
    occurredAt: timestamp('occurred_at', {
        precision: 3,
        mode: 'string',
    }).notNull(),
    sessionDataId: text(),
})

export const inActiveWallets = pgTable(
    'in_active_wallets',
    {
        id: varchar().primaryKey().notNull(),
        balance: integer().notNull(),
        paymentMethod: text('payment_method').default('INSTORE_CASH').notNull(),
        currency: text().default('USD').notNull(),
        isActive: boolean('is_active').notNull(),
        isDefault: boolean('is_default').notNull(),
        address: text(),
        cashtag: text(),
        userId: text('user_id'),
        operatorId: text('operator_id').notNull(),
        lastUsedAt: timestamp('last_used_at', { precision: 3, mode: 'string' }),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        unique('in_active_wallets_address_unique').on(table.address),
        unique('in_active_wallets_cashtag_unique').on(table.cashtag),
    ]
)

export const blackjackBets = pgTable(
    'blackjack_bets',
    {
        id: varchar().primaryKey().notNull(),
        userId: varchar('user_id').notNull(),
        gameId: varchar('game_id').notNull(),
        seat: integer().notNull(),
        amount: jsonb().notNull(),
        cards: jsonb(),
        cardsLeft: jsonb('cards_left'),
        cardsRight: jsonb('cards_right'),
        actions: jsonb(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'blackjack_bets_user_id_users_id_fk',
        }),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [blackjackGames.id],
            name: 'blackjack_bets_game_id_blackjack_games_id_fk',
        }),
    ]
)

export const favoriteGames = pgTable(
    'favorite_games',
    {
        id: varchar().primaryKey().notNull(),
        userId: text('user_id').notNull(),
        gameId: text('game_id').notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'favorite_games_user_id_users_id_fk',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'favorite_games_game_id_games_id_fk',
        }).onDelete('cascade'),
    ]
)

export const gameHistory = pgTable(
    'game_history',
    {
        id: varchar().primaryKey().notNull(),
        userId: text('user_id').notNull(),
        gameId: text('game_id').notNull(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'game_history_user_id_users_id_fk',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'game_history_game_id_games_id_fk',
        }).onDelete('cascade'),
    ]
)

export const jackpots = pgTable(
    'jackpots',
    {
        id: varchar().primaryKey().notNull(),
        type: text().notNull(),
        currentAmountCoins: integer('current_amount_coins').notNull(),
        seedAmountCoins: integer('seed_amount_coins').notNull(),
        minimumBetCoins: integer('minimum_bet_coins').default(1).notNull(),
        contributionRateBasisPoints: integer(
            'contribution_rate_basis_points'
        ).notNull(),
        probabilityPerMillion: integer('probability_per_million').notNull(),
        minimumTimeBetweenWinsMinutes: integer(
            'minimum_time_between_wins_minutes'
        ).notNull(),
        lastWonAt: timestamp('last_won_at', { precision: 3, mode: 'string' }),
        lastWonBy: text('last_won_by'),
        isActive: boolean('is_active').default(true).notNull(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.lastWonBy],
            foreignColumns: [users.id],
            name: 'jackpots_lastWinner_fkey',
        })
            .onUpdate('cascade')
            .onDelete('set null'),
    ]
)

export const products = pgTable(
    'products',
    {
        id: varchar().primaryKey().notNull(),
        title: text().default('default').notNull(),
        productType: text('product_type').default('bundle').notNull(),
        bonusTotalInCredits: integer('bonus_total_in_credits').notNull(),
        isActive: boolean('is_active'),
        priceInCents: integer('price_in_cents').notNull(),
        amountToReceiveInCredits: integer('amount_to_receive_in_credits').notNull(),
        bestValue: integer('best_value').notNull(),
        discountInCents: integer('discount_in_cents').notNull(),
        bonusSpins: integer('bonus_spins').notNull(),
        isPromo: boolean('is_promo'),
        totalDiscountInCents: integer('total_discount_in_cents').notNull(),
        operatorId: text('operator_id'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.operatorId],
            foreignColumns: [operators.id],
            name: 'products_operator_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ]
)

export const settings = pgTable('settings', {
    id: varchar().primaryKey().notNull(),
    generalMaintenanceEnabled: boolean('general_maintenance_enabled')
        .default(false)
        .notNull(),
    generalRainEnabled: boolean('general_rain_enabled').default(false),
    generalTipEnabled: boolean('general_tip_enabled').default(false),
    gameBlackjackEnabled: boolean('game_blackjack_enabled').default(true),
    blackjackMinBetStandard: integer('blackjack_min_bet_standard')
        .default(100)
        .notNull(),
    blackjackMaxBetStandard: integer('blackjack_max_bet_standard')
        .default(50000)
        .notNull(),
    blackjackMinBetWhale: integer('blackjack_min_bet_whale')
        .default(1000)
        .notNull(),
    blackjackMaxBetWhale: integer('blackjack_max_bet_whale')
        .default(250000)
        .notNull(),
    blackjackDeckCount: integer('blackjack_deck_count').default(6).notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
        .defaultNow()
        .notNull(),
})

export const jackpotWins = pgTable(
    'jackpot_wins',
    {
        id: varchar().primaryKey().notNull(),
        jackpotId: text('jackpot_id').notNull(),
        winnerId: text('winner_id').notNull(),
        winAmountCoins: integer('win_amount_coins').notNull(),
        gameSpinId: text('game_spin_id').notNull(),
        transactionId: text('transaction_id'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        sessionDataId: text('session_data_id'),
    },
    (table) => [
        foreignKey({
            columns: [table.gameSpinId],
            foreignColumns: [gameSpins.id],
            name: 'jackpot_wins_gameSpin_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        foreignKey({
            columns: [table.jackpotId],
            foreignColumns: [jackpots.id],
            name: 'jackpot_wins_jackpot_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        foreignKey({
            columns: [table.winnerId],
            foreignColumns: [users.id],
            name: 'jackpot_wins_winner_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        unique('jackpot_wins_game_spin_id_unique').on(table.gameSpinId),
    ]
)

export const tournamentParticipants = pgTable(
    'tournament_participants',
    {
        id: varchar().primaryKey().notNull(),
        tournamentId: text('tournament_id').notNull(),
        userId: text('user_id').notNull(),
        score: integer().notNull(),
        rank: integer(),
        joinedAt: timestamp('joined_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'tournament_participants_user_id_users_id_fk',
        }).onDelete('cascade'),
    ]
)

export const vipLevel = pgTable('VipLevel', {
    level: integer().primaryKey().notNull(),
    xpForNext: integer().notNull(),
})

export const wallets = pgTable(
    'wallets',
    {
        id: varchar().primaryKey().notNull(),
        balance: integer().notNull(),
        paymentMethod: text('payment_method').default('INSTORE_CASH').notNull(),
        currency: text().default('USD').notNull(),
        isActive: boolean('is_active').default(true).notNull(),
        isDefault: boolean('is_default').notNull(),
        address: text(),
        cashtag: text(),
        userId: text('user_id').notNull(),
        operatorId: text('operator_id').notNull(),
        lastUsedAt: timestamp('last_used_at', { precision: 3, mode: 'string' }),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'wallets_user_id_users_id_fk',
        }).onDelete('cascade'),
        unique('wallets_address_unique').on(table.address),
        unique('wallets_cashtag_unique').on(table.cashtag),
    ]
)

export const vipRank = pgTable(
    'VipRank',
    {
        id: integer().primaryKey().notNull(),
        name: text().notNull(),
        minXp: integer().notNull(),
        dailyBonusCoinPct: integer().notNull(),
        hourlyBonusCoinPct: integer().notNull(),
        purchaseBonusCoinPct: integer().notNull(),
        levelUpBonusCoinPct: integer().notNull(),
        hasConcierge: boolean().notNull(),
        hasVipLoungeAccess: boolean().notNull(),
        isInvitationOnly: boolean().notNull(),
    },
    (table) => [
        unique('VipRank_name_unique').on(table.name),
        unique('VipRank_minXp_unique').on(table.minXp),
    ]
)

export const appVersions = pgTable(
    'app_versions',
    {
        id: serial().primaryKey().notNull(),
        appId: text('app_id').notNull(),
        version: text().notNull(),
        platform: text().notNull(),
        updateType: text('update_type').notNull(),
        downloadUrl: text('download_url').notNull(),
        changelog: text().array().notNull(),
        mandatory: boolean().default(false).notNull(),
        releaseDate: timestamp('release_date', {
            withTimezone: true,
            mode: 'string',
        }).notNull(),
        fileSize: integer('file_size').notNull(),
        checksum: text().notNull(),
    },
    (table) => [
        unique('version_unique_idx').on(table.appId, table.version, table.platform),
    ]
)

export const rtgSettingsRequestUserData = pgTable(
    'rtg_settings_request_user_data',
    {
        id: varchar().primaryKey().notNull(),
        requestId: text('request_id').notNull(),
        userId: text('user_id').notNull(),
        hash: text().notNull(),
        affiliate: text().notNull(),
        lang: text().notNull(),
        channel: text().notNull(),
        userType: text('user_type').notNull(),
        fingerprint: text().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.requestId],
            foreignColumns: [rtgSettingsRequests.id],
            name: 'rtg_settings_request_user_data_request_id_rtg_settings_requests',
        }),
    ]
)

export const rtgSettingsRequestCustomData = pgTable(
    'rtg_settings_request_custom_data',
    {
        id: varchar().primaryKey().notNull(),
        requestId: text('request_id').notNull(),
        siteId: text('site_id').notNull(),
        extras: text().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.requestId],
            foreignColumns: [rtgSettingsRequests.id],
            name: 'rtg_settings_request_custom_data_request_id_rtg_settings_reques',
        }),
    ]
)

export const rtgSettingsResponses = pgTable(
    'rtg_settings_responses',
    {
        id: serial().primaryKey().notNull(),
        gameId: varchar('game_id'),
        gameName: text('game_name').notNull(),
        success: boolean().notNull(),
        userId: integer('user_id'),
        userToken: text('user_token'),
        userSessionId: text('user_session_id'),
        userCanGamble: boolean('user_can_gamble'),
        userCountry: text('user_country'),
        userCasino: text('user_casino'),
        userCurrencyCode: text('user_currency_code'),
        userCurrencySymbol: text('user_currency_symbol'),
        userServerTime: timestamp('user_server_time', { mode: 'string' }),
        userBalanceCash: numeric('user_balance_cash'),
        userBalanceFreeBets: numeric('user_balance_free_bets'),
        userBalanceBonus: numeric('user_balance_bonus'),
        userStakesDefaultIndex: integer('user_stakes_default_index'),
        userStakesLastIndex: integer('user_stakes_last_index'),
        gameCols: integer('game_cols'),
        gameRows: integer('game_rows'),
        gamePaysType: text('game_pays_type'),
        gameVersion: text('game_version'),
        gameVolatilityIndex: text('game_volatility_index'),
        gameRtpDefault: numeric('game_rtp_default'),
        gameHasGamble: boolean('game_has_gamble'),
        gameHasFeatureBuy: boolean('game_has_feature_buy'),
        launcherVersion: text('launcher_version'),
        userBonuses: json('user_bonuses'),
        userAutoplay: json('user_autoplay'),
        gameLines: json('game_lines'),
        gameTiles: json('game_tiles'),
        gameFeatures: json('game_features'),
        gameMultiplierSequence: json('game_multiplier_sequence'),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'rtg_settings_responses_game_id_games_id_fk',
        }),
        unique('rtg_settings_responses_game_name_unique').on(table.gameName),
    ]
)

export const rtgSpinRequestUserData = pgTable(
    'rtg_spin_request_user_data',
    {
        id: varchar().primaryKey().notNull(),
        requestId: text('request_id').notNull(),
        userId: integer('user_id').notNull(),
        affiliate: text().notNull(),
        lang: text().notNull(),
        channel: text().notNull(),
        userType: text('user_type').notNull(),
        fingerprint: text().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.requestId],
            foreignColumns: [rtgSpinRequests.id],
            name: 'rtg_spin_request_user_data_request_id_rtg_spin_requests_id_fk',
        }),
    ]
)

export const rtgSpinRequestCustomData = pgTable(
    'rtg_spin_request_custom_data',
    {
        id: varchar().primaryKey().notNull(),
        requestId: text('request_id').notNull(),
        siteId: text('site_id').notNull(),
        extras: text().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.requestId],
            foreignColumns: [rtgSpinRequests.id],
            name: 'rtg_spin_request_custom_data_request_id_rtg_spin_requests_id_fk',
        }),
    ]
)

export const tasks = pgTable('tasks', {
    id: varchar().primaryKey().notNull(),
    name: text().notNull(),
    done: boolean().default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
})

export const rtgSettingsRequests = pgTable('rtg_settings_requests', {
    id: varchar().primaryKey().notNull(),
    token: text(),
    sessionId: text('session_id').notNull(),
    playMode: text('play_mode').notNull(),
    gameId: text('game_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
})

export const rtgSpinRequests = pgTable('rtg_spin_requests', {
    id: varchar().primaryKey().notNull(),
    token: text().notNull(),
    sessionId: text('session_id').notNull(),
    playMode: text('play_mode').notNull(),
    gameId: text('game_id').notNull(),
    stake: integer().notNull(),
    bonusId: text('bonus_id'),
    extras: text(),
    gameMode: integer('game_mode').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
})

export const authSessions = pgTable(
    'auth_sessions',
    {
        id: varchar().primaryKey().notNull(),
        userId: text('user_id').notNull(),
        status: sessionStatus().default('ACTIVE').notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        deviceId: text('device_id'),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
        lastSeen: timestamp('last_seen', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('auth_session_status_idx').using(
            'btree',
            table.status.asc().nullsLast().op('enum_ops')
        ),
        index('auth_session_user_idx').using(
            'btree',
            table.userId.asc().nullsLast().op('text_ops'),
            table.createdAt.asc().nullsLast().op('text_ops')
        ),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'auth_sessions_user_id_users_id_fk',
        }).onDelete('cascade'),
    ]
)

export const games = pgTable(
    'games',
    {
        id: varchar().primaryKey().notNull(),
        name: text().notNull(),
        title: text().notNull(),
        configuration: jsonb(),
        description: text(),
        category: text().notNull(),
        tags: text().array().notNull(),
        thumbnailUrl: text('thumbnail_url'),
        bannerUrl: text('banner_url'),
        developer: text().notNull(),
        providerId: text('provider_id'),
        totalWagered: integer('total_wagered').notNull(),
        totalWon: integer('total_won').notNull(),
        targetRtp: integer('target_rtp'),
        isFeatured: boolean('is_featured').notNull(),
        isActive: boolean('is_active').default(true).notNull(),
        operatorId: text('operator_id'),
        tournamentDirectives: jsonb('tournament_directives'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        gameLogic: jsonb('game_logic'),
    },
    (table) => [
        foreignKey({
            columns: [table.operatorId],
            foreignColumns: [operators.id],
            name: 'games_operator_fkey',
        })
            .onUpdate('cascade')
            .onDelete('set null'),
        unique('games_name_key').on(table.name),
    ]
)

export const users = pgTable(
    'users',
    {
        id: varchar().primaryKey().notNull(),
        username: text().notNull(),
        email: text(),
        passwordHash: text('password_hash'),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at', {
            precision: 3,
            mode: 'string',
        }),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
            precision: 3,
            mode: 'string',
        }),
        currentGameSessionDataId: text('current_game_session_data_id'),
        currentAuthSessionDataId: text('current_auth_session_data_id'),
        avatarUrl: text('avatar_url').default('avatar-01'),
        role: text().default('USER').notNull(),
        isActive: boolean('is_active').default(true).notNull(),
        lastLoginAt: timestamp('last_login_at', { precision: 3, mode: 'string' }),
        totalXpGained: integer('total_xp_gained').notNull(),
        activeWalletId: text('active_wallet_id'),
        vipInfoId: text('vip_info_id'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deleted_at', { precision: 3, mode: 'string' }),
        lastSeen: timestamp('last_seen', { precision: 3, mode: 'string' }),
    },
    (table) => [
        unique('users_username_unique').on(table.username),
        unique('users_email_unique').on(table.email),
        unique('users_current_game_session_data_id_unique').on(
            table.currentGameSessionDataId
        ),
        unique('users_current_auth_session_data_id_unique').on(
            table.currentAuthSessionDataId
        ),
        unique('users_active_wallet_id_unique').on(table.activeWalletId),
        unique('users_vip_info_id_unique').on(table.vipInfoId),
    ]
)

export const operators = pgTable(
    'operators',
    {
        id: varchar().primaryKey().notNull(),
        name: text().notNull(),
        operatorSecret: text('operator_secret').notNull(),
        operatorAccess: text('operator_access').notNull(),
        callbackUrl: text('callback_url').notNull(),
        isActive: boolean('is_active').default(true).notNull(),
        allowedIps: text('allowed_ips').array().notNull(),
        description: text(),
        productIds: text('product_ids'),
        balance: integer().notNull(),
        netRevenue: integer('net-revenue').notNull(),
        acceptedPayments: text('accepted_payments').array().notNull(),
        ownerId: text('owner_id'),
        lastUsedAt: timestamp('last_used_at', { precision: 3, mode: 'string' }),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [unique('operators_name_unique').on(table.name)]
)

export const vipInfo = pgTable(
    'vip_info',
    {
        id: varchar().primaryKey().notNull(),
        level: integer().default(1).notNull(),
        xp: integer().notNull(),
        totalXp: integer().notNull(),
        userId: text().notNull(),
        currentRankid: integer(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'vip_info_user_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        foreignKey({
            columns: [table.currentRankid],
            foreignColumns: [vipRank.id],
            name: 'vip_info_currentRank_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        unique('vip_info_userId_unique').on(table.userId),
    ]
)

export const transactions = pgTable(
    'transactions',
    {
        id: varchar().primaryKey().notNull(),
        processedAt: timestamp('processed_at', { precision: 3, mode: 'string' }),
        walletId: text('wallet_id'),
        type: text().notNull(),
        status: text().default('PENDING').notNull(),
        amount: integer().notNull(),
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
        description: text(),
        provider: text(),
        providerTxId: text('provider_tx_id'),
        relatedGameId: text('related_game_id'),
        relatedRoundId: text('related_round_id'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        operatorId: text('operator_id'),
        userId: text('user_id'),
    },
    (table) => [
        foreignKey({
            columns: [table.productId],
            foreignColumns: [products.id],
            name: 'transactions_product_fkey',
        })
            .onUpdate('cascade')
            .onDelete('set null'),
        foreignKey({
            columns: [table.walletId],
            foreignColumns: [wallets.id],
            name: 'transactions_wallet_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ]
)

export const vipLevelUpHistory = pgTable(
    'vip_level_up_history',
    {
        id: varchar().primaryKey().notNull(),
        previousLevel: integer('previous_level').notNull(),
        newLevel: integer('new_level').notNull(),
        timestamp: timestamp({ precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        vipInfoId: text('vip_info_id').notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.vipInfoId],
            foreignColumns: [vipInfo.id],
            name: 'vip_level_up_history_vipInfo_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ]
)

export const rtgSpinResults = pgTable(
    'rtg_spin_results',
    {
        id: serial().primaryKey().notNull(),
        gameId: varchar('game_id'),
        gameName: text('game_name').notNull(),
        success: boolean().notNull(),
        userId: integer('user_id').notNull(),
        sessionId: text('session_id'),
        canGamble: boolean('can_gamble'),
        token: text(),
        sessionNetPosition: numeric('session_net_position'),
        serverTime: timestamp('server_time', { mode: 'string' }),
        balanceCashAtStart: numeric('balance_cash_at_start'),
        balanceCashAfterBet: numeric('balance_cash_after_bet'),
        balanceCashAtEnd: numeric('balance_cash_at_end'),
        balanceFreeBetsAtStart: numeric('balance_free_bets_at_start'),
        balanceFreeBetsAfterBet: numeric('balance_free_bets_after_bet'),
        balanceFreeBetsAtEnd: numeric('balance_free_bets_at_end'),
        balanceBonusAtStart: numeric('balance_bonus_at_start'),
        balanceBonusAfterBet: numeric('balance_bonus_after_bet'),
        balanceBonusAtEnd: numeric('balance_bonus_at_end'),
        limitsBetThresholdTime: integer('limits_bet_threshold_time'),
        bonuses: json(),
        tournaments: json(),
        vouchers: json(),
        messages: json(),
        stake: numeric(),
        multiplier: numeric(),
        winTotal: numeric('win_total'),
        winsMultipliersTotal: numeric('wins_multipliers_total'),
        winsMultipliersLines: numeric('wins_multipliers_lines'),
        spinMode: text('spin_mode'),
        hasState: boolean('has_state'),
        winLines: json('win_lines'),
        fatTiles: json('fat_tiles'),
        scatters: json(),
        features: json(),
        reelsBuffer: json('reels_buffer'),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'rtg_spin_results_game_id_games_id_fk',
        }),
    ]
)

export const jackpotContributions = pgTable(
    'jackpot_contributions',
    {
        id: varchar().primaryKey().notNull(),
        jackpotId: text('jackpot_id').notNull(),
        userId: text('user_id'),
        gameSpinId: text('game_spin_id').notNull(),
        contributionAmountCoins: integer('contribution_amount_coins').notNull(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex('JackpotContribution_jackpotId_gameSpinId_key').using(
            'btree',
            table.jackpotId.asc().nullsLast().op('text_ops'),
            table.gameSpinId.asc().nullsLast().op('text_ops')
        ),
        foreignKey({
            columns: [table.gameSpinId],
            foreignColumns: [gameSpins.id],
            name: 'jackpot_contributions_gameSpin_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
        foreignKey({
            columns: [table.jackpotId],
            foreignColumns: [jackpots.id],
            name: 'jackpot_contributions_jackpot_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ]
)
