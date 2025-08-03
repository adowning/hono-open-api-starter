import { boolean, decimal, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { nanoid } from '../../utils/nanoid'

export const rtgSettingsRequests = pgTable('rtg_settings_requests', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    token: text('token'),
    sessionId: text('session_id').notNull(),
    playMode: text('play_mode').notNull(),
    gameId: text('game_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const rtgSettingsRequestUserData = pgTable('rtg_settings_request_user_data', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    requestId: text('request_id').notNull().references(() => rtgSettingsRequests.id),
    userId: text('user_id').notNull(),
    hash: text('hash').notNull(),
    affiliate: text('affiliate').notNull(),
    lang: text('lang').notNull(),
    channel: text('channel').notNull(),
    userType: text('user_type').notNull(),
    fingerprint: text('fingerprint').notNull(),
})

export const rtgSettingsRequestCustomData = pgTable('rtg_settings_request_custom_data', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    requestId: text('request_id').notNull().references(() => rtgSettingsRequests.id),
    siteId: text('site_id').notNull(),
    extras: text('extras').notNull(),
})

export const rtgSpinRequests = pgTable('rtg_spin_requests', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    token: text('token').notNull(),
    sessionId: text('session_id').notNull(),
    playMode: text('play_mode').notNull(),
    gameId: text('game_id').notNull(),
    stake: integer('stake').notNull(),
    bonusId: text('bonus_id'),
    extras: text('extras'),
    gameMode: integer('game_mode').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const rtgSpinRequestUserData = pgTable('rtg_spin_request_user_data', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    requestId: text('request_id').notNull().references(() => rtgSpinRequests.id),
    userId: integer('user_id').notNull(),
    affiliate: text('affiliate').notNull(),
    lang: text('lang').notNull(),
    channel: text('channel').notNull(),
    userType: text('user_type').notNull(),
    fingerprint: text('fingerprint').notNull(),
})

export const rtgSpinRequestCustomData = pgTable('rtg_spin_request_custom_data', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    requestId: text('request_id').notNull().references(() => rtgSpinRequests.id),
    siteId: text('site_id').notNull(),
    extras: text('extras').notNull(),
})

export const rtgSettingsResults = pgTable('rtg_settings_results', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    success: boolean('success').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const rtgSettingsResultUser = pgTable('rtg_settings_result_user', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    settingsResultId: text('settings_result_id').notNull().references(() => rtgSettingsResults.id),
    userId: integer('user_id').notNull(),
    country: text('country').notNull(),
    casino: text('casino').notNull(),
    token: text('token').notNull(),
    sessionId: text('session_id').notNull(),
    canGamble: boolean('can_gamble').notNull(),
    lastWin: decimal('last_win').notNull(),
    serverTime: timestamp('server_time').notNull(),
})

export const rtgSettingsResultUserBalance = pgTable('rtg_settings_result_user_balance', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    settingsResultUserId: varchar('settings_result_user_id').notNull().references(() => rtgSettingsResultUser.id),
    cash: decimal('cash').notNull(),
    freeBets: decimal('free_bets').notNull(),
    sessionCash: decimal('session_cash').notNull(),
    sessionFreeBets: decimal('session_free_bets').notNull(),
    bonus: decimal('bonus').notNull(),
})

export const rtgSettingsResultGame = pgTable('rtg_settings_result_game', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    settingsResultId: text('settings_result_id').notNull().references(() => rtgSettingsResults.id),
    cols: integer('cols').notNull(),
    rows: integer('rows').notNull(),
    version: text('version').notNull(),
    rtpDefault: decimal('rtp_default').notNull(),
    volatilityIndex: decimal('volatility_index').notNull(),
    maxMultiplier: decimal('max_multiplier').notNull(),
    gameType: text('game_type').notNull(),
    hasState: boolean('has_state').notNull(),
})

export const rtgSpinResults = pgTable('rtg_spin_results', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    success: boolean('success').notNull(),
    errorCode: integer('error_code'),
    createdAt: timestamp('created_at').defaultNow(),
})

export const rtgSpinResultUser = pgTable('rtg_spin_result_user', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    spinResultId: text('spin_result_id').notNull().references(() => rtgSpinResults.id),
    canGamble: boolean('can_gamble').notNull(),
    userId: integer('user_id').notNull(),
    sessionId: text('session_id').notNull(),
    sessionNetPosition: decimal('session_net_position').notNull(),
    token: text('token').notNull(),
    serverTime: timestamp('server_time').notNull(),
})

export const rtgSpinResultUserBalance = pgTable('rtg_spin_result_user_balance', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    spinResultUserId: varchar('spin_result_user_id').notNull().references(() => rtgSpinResultUser.id),
    cashAtStart: decimal('cash_at_start').notNull(),
    cashAfterBet: decimal('cash_after_bet').notNull(),
    cashAtEnd: decimal('cash_at_end').notNull(),
    freeBetsAtStart: decimal('free_bets_at_start').notNull(),
    freeBetsAfterBet: decimal('free_bets_after_bet').notNull(),
    freeBetsAtEnd: decimal('free_bets_at_end').notNull(),
    bonusAtStart: decimal('bonus_at_start').notNull(),
    bonusAfterBet: decimal('bonus_after_bet').notNull(),
    bonusAtEnd: decimal('bonus_at_end').notNull(),
})

export const rtgSpinResultGame = pgTable('rtg_spin_result_game', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    spinResultId: text('spin_result_id').notNull().references(() => rtgSpinResults.id),
    stake: decimal('stake').notNull(),
    multiplier: integer('multiplier').notNull(),
    hasState: boolean('has_state').notNull(),
})

export const rtgSpinResultGameWin = pgTable('rtg_spin_result_game_win', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    spinResultGameId: varchar('spin_result_game_id').notNull().references(() => rtgSpinResultGame.id),
    lines: decimal('lines').notNull(),
    total: decimal('total').notNull(),
})
