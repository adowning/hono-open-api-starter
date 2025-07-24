import { relations } from "drizzle-orm";
import { boolean, decimal, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import z from "zod";

import { nanoid } from "#/utils/nanoid";

// =================================================================
// Schema for RTG Settings Request
// =================================================================

export const rtgSettingsRequests = pgTable("rtg_settings_requests", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  token: text("token"),
  sessionId: text("session_id").notNull(),
  playMode: text("play_mode").notNull(),
  gameId: text("game_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rtgSettingsRequestUserData = pgTable("rtg_settings_request_user_data", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  requestId: text("request_id").notNull().references(() => rtgSettingsRequests.id),
  userId: text("user_id").notNull(),
  hash: text("hash").notNull(),
  affiliate: text("affiliate").notNull(),
  lang: text("lang").notNull(),
  channel: text("channel").notNull(),
  userType: text("user_type").notNull(),
  fingerprint: text("fingerprint").notNull(),
});

export const rtgSettingsRequestCustomData = pgTable("rtg_settings_request_custom_data", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  requestId: text("request_id").notNull().references(() => rtgSettingsRequests.id),
  siteId: text("site_id").notNull(),
  extras: text("extras").notNull(),
});

export const rtgSettingsRequestsRelations = relations(rtgSettingsRequests, ({ one }) => ({
  userData: one(rtgSettingsRequestUserData, {
    fields: [rtgSettingsRequests.id],
    references: [rtgSettingsRequestUserData.requestId],
  }),
  customData: one(rtgSettingsRequestCustomData, {
    fields: [rtgSettingsRequests.id],
    references: [rtgSettingsRequestCustomData.requestId],
  }),
}));

// =================================================================
// Schema for RTG Spin Request
// =================================================================

export const rtgSpinRequests = pgTable("rtg_spin_requests", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  token: text("token").notNull(),
  sessionId: text("session_id").notNull(),
  playMode: text("play_mode").notNull(),
  gameId: text("game_id").notNull(),
  stake: integer("stake").notNull(),
  bonusId: text("bonus_id"),
  extras: text("extras"),
  gameMode: integer("game_mode").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rtgSpinRequestUserData = pgTable("rtg_spin_request_user_data", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  requestId: text("request_id").notNull().references(() => rtgSpinRequests.id),
  userId: integer("user_id").notNull(),
  affiliate: text("affiliate").notNull(),
  lang: text("lang").notNull(),
  channel: text("channel").notNull(),
  userType: text("user_type").notNull(),
  fingerprint: text("fingerprint").notNull(),
});

export const rtgSpinRequestCustomData = pgTable("rtg_spin_request_custom_data", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  requestId: text("request_id").notNull().references(() => rtgSpinRequests.id),
  siteId: text("site_id").notNull(),
  extras: text("extras").notNull(),
});

export const rtgSpinRequestsRelations = relations(rtgSpinRequests, ({ one }) => ({
  userData: one(rtgSpinRequestUserData, {
    fields: [rtgSpinRequests.id],
    references: [rtgSpinRequestUserData.requestId],
  }),
  customData: one(rtgSpinRequestCustomData, {
    fields: [rtgSpinRequests.id],
    references: [rtgSpinRequestCustomData.requestId],
  }),
}));

// =================================================================
// Schema for RTG Settings Response
// =================================================================

export const rtgSettingsResults = pgTable("rtg_settings_results", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rtgSettingsResultUser = pgTable("rtg_settings_result_user", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  settingsResultId: text("settings_result_id").notNull().references(() => rtgSettingsResults.id),
  userId: integer("user_id").notNull(),
  country: text("country").notNull(),
  casino: text("casino").notNull(),
  token: text("token").notNull(),
  sessionId: text("session_id").notNull(),
  canGamble: boolean("can_gamble").notNull(),
  lastWin: decimal("last_win").notNull(),
  serverTime: timestamp("server_time").notNull(),
});

export const rtgSettingsResultUserBalance = pgTable("rtg_settings_result_user_balance", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  settingsResultUserId: varchar("settings_result_user_id").notNull().references(() => rtgSettingsResultUser.id),
  cash: decimal("cash").notNull(),
  freeBets: decimal("free_bets").notNull(),
  sessionCash: decimal("session_cash").notNull(),
  sessionFreeBets: decimal("session_free_bets").notNull(),
  bonus: decimal("bonus").notNull(),
});

export const rtgSettingsResultGame = pgTable("rtg_settings_result_game", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  settingsResultId: text("settings_result_id").notNull().references(() => rtgSettingsResults.id),
  cols: integer("cols").notNull(),
  rows: integer("rows").notNull(),
  version: text("version").notNull(),
  rtpDefault: decimal("rtp_default").notNull(),
  volatilityIndex: decimal("volatility_index").notNull(),
  maxMultiplier: decimal("max_multiplier").notNull(),
  gameType: text("game_type").notNull(),
  hasState: boolean("has_state").notNull(),
});

export const rtgSettingsResultsRelations = relations(rtgSettingsResults, ({ one }) => ({
  user: one(rtgSettingsResultUser, { fields: [rtgSettingsResults.id], references: [rtgSettingsResultUser.settingsResultId] }),
  game: one(rtgSettingsResultGame, { fields: [rtgSettingsResults.id], references: [rtgSettingsResultGame.settingsResultId] }),
}));

export const rtgSettingsResultUserRelations = relations(rtgSettingsResultUser, ({ one }) => ({
  balance: one(rtgSettingsResultUserBalance, { fields: [rtgSettingsResultUser.id], references: [rtgSettingsResultUserBalance.settingsResultUserId] }),
}));

// =================================================================
// Schema for RTG Spin Result
// =================================================================

export const rtgSpinResults = pgTable("rtg_spin_results", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  success: boolean("success").notNull(),
  errorCode: integer("error_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rtgSpinResultUser = pgTable("rtg_spin_result_user", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  spinResultId: text("spin_result_id").notNull().references(() => rtgSpinResults.id),
  canGamble: boolean("can_gamble").notNull(),
  userId: integer("user_id").notNull(),
  sessionId: text("session_id").notNull(),
  sessionNetPosition: decimal("session_net_position").notNull(),
  token: text("token").notNull(),
  serverTime: timestamp("server_time").notNull(),
});

export const rtgSpinResultUserBalance = pgTable("rtg_spin_result_user_balance", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  spinResultUserId: varchar("spin_result_user_id").notNull().references(() => rtgSpinResultUser.id),
  cashAtStart: decimal("cash_at_start").notNull(),
  cashAfterBet: decimal("cash_after_bet").notNull(),
  cashAtEnd: decimal("cash_at_end").notNull(),
  freeBetsAtStart: decimal("free_bets_at_start").notNull(),
  freeBetsAfterBet: decimal("free_bets_after_bet").notNull(),
  freeBetsAtEnd: decimal("free_bets_at_end").notNull(),
  bonusAtStart: decimal("bonus_at_start").notNull(),
  bonusAfterBet: decimal("bonus_after_bet").notNull(),
  bonusAtEnd: decimal("bonus_at_end").notNull(),
});

export const rtgSpinResultGame = pgTable("rtg_spin_result_game", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  spinResultId: text("spin_result_id").notNull().references(() => rtgSpinResults.id),
  stake: decimal("stake").notNull(),
  multiplier: integer("multiplier").notNull(),
  hasState: boolean("has_state").notNull(),
});

export const rtgSpinResultGameWin = pgTable("rtg_spin_result_game_win", {
  id: varchar("id").primaryKey().$defaultFn(nanoid),

  spinResultGameId: varchar("spin_result_game_id").notNull().references(() => rtgSpinResultGame.id),
  lines: decimal("lines").notNull(),
  total: decimal("total").notNull(),
});

export const rtgSpinResultRelations = relations(rtgSpinResults, ({ one }) => ({
  user: one(rtgSpinResultUser, { fields: [rtgSpinResults.id], references: [rtgSpinResultUser.spinResultId] }),
  game: one(rtgSpinResultGame, { fields: [rtgSpinResults.id], references: [rtgSpinResultGame.spinResultId] }),
}));

export const rtgSpinResultUserRelations = relations(rtgSpinResultUser, ({ one }) => ({
  balance: one(rtgSpinResultUserBalance, { fields: [rtgSpinResultUser.id], references: [rtgSpinResultUserBalance.spinResultUserId] }),
}));

export const rtgSpinResultGameRelations = relations(rtgSpinResultGame, ({ one }) => ({
  win: one(rtgSpinResultGameWin, { fields: [rtgSpinResultGame.id], references: [rtgSpinResultGameWin.spinResultGameId] }),
}));

// Schema for ProviderSettingsResponseData
export const providerSettingsResponseDataSchema = z.object({
  user: z.object({
    balance: z.object({
      cash: z.string(),
      freeBets: z.string().optional(),
      bonus: z.string().optional(),
    }),
    canGamble: z.boolean(),
    userId: z.union([z.number(), z.string()]),
    sessionId: z.string(),
    sessionNetPosition: z.string().optional(),
    token: z.string(),
    country: z.string().optional(),
    currency: z.object({
      code: z.string(),
      symbol: z.string(),
    }).optional(),
    stakes: z.any().optional(),
    limits: z.any().optional(),
    serverTime: z.string().datetime({ message: "Invalid ISO date string" }),
  }),
  game: z.object({
    version: z.string().optional(),
    gameType: z.string().optional(),
  }).optional(),
  launcher: z.object({
    version: z.string().optional(),
  }).optional(),
  jackpots: z.any().optional(),
});

// Schema for RTGSettingsResponseDto
export const rtgSettingsResponseDtoSchema = z.object({
  success: z.boolean(),
  result: providerSettingsResponseDataSchema.optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
}).refine(data => data.success ? data.result !== undefined : data.error !== undefined, {
  message: "If success is true, result must be provided. If false, error must be provided.",
});

// --- Spin Schemas ---

// Schema for ProviderSpinResponseData
export const providerSpinResponseDataSchema = z.object({
  transactions: z.object({
    roundId: z.union([z.number(), z.string()]),
  }),
  user: z.object({
    balance: z.object({
      cash: z.object({
        atStart: z.string().optional(),
        afterBet: z.string().optional(),
        atEnd: z.string(),
      }),
      freeBets: z.object({
        atStart: z.string().optional(),
        afterBet: z.string().optional(),
        atEnd: z.string(),
      }).optional(),
      bonus: z.object({
        atStart: z.string().optional(),
        afterBet: z.string().optional(),
        atEnd: z.string(),
      }).optional(),
    }),
    userId: z.union([z.number(), z.string()]),
    sessionId: z.string(),
    sessionNetPosition: z.string().optional(),
    token: z.string(),
    serverTime: z.string().datetime({ message: "Invalid ISO date string" }),
    canGamble: z.boolean().optional(),
  }),
  game: z.object({
    win: z.object({
      instantWin: z.string().optional(),
      lines: z.string().optional(),
      total: z.string(),
    }),
    stake: z.string(),
    multiplier: z.number().optional(),
    winLines: z.array(z.any()).optional(),
    reelsBuffer: z.array(z.array(z.array(z.number()))).optional(),
  }),
  jackpots: z.any().nullable().optional(),
  bonusChance: z.any().nullable().optional(),
}); ;

// Schema for RtgSpinResult (alias)
export const rtgSpinResultSchema = providerSpinResponseDataSchema;

// Schema for RTGSpinResponseDto
export const rtgSpinResponseDtoSchema = z.object({
  success: z.boolean(),
  result: rtgSpinResultSchema.optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
}).refine(data => data.success ? data.result !== undefined : data.error !== undefined, {
  message: "If success is true, result must be provided. If false, error must be provided.",
});

// --- Launch and Request Schemas ---

// Schema for LaunchGameResponseDto
export const launchGameResponseDtoSchema = z.object({
  launch_url: z.string().url(),
  game_session_id: z.string().optional(),
  launch_strategy: z.enum(["IFRAME", "REDIRECT", "POPUP"]).optional(),
  provider_parameters: z.union([z.record(z.any(), z.any()), z.array(z.string()), z.string()]).optional(),
});

// A reusable schema for custom and userData objects
const customObjectSchema = z.object({
  siteId: z.string().optional(),
  extras: z.string().optional(),
}).optional();

const userDataObjectSchema = z.object({
  userId: z.union([z.string(), z.number()]).optional(),
  hash: z.string().optional(),
  affiliate: z.union([z.string(), z.number()]).optional(),
  lang: z.union([z.string(), z.number()]).optional(),
  channel: z.union([z.string(), z.number()]).optional(),
  userType: z.string().optional(),
  fingerprint: z.union([z.string(), z.number()]).optional(),
}).optional();

// Schema for RTGSettingsRequestDto
export const rtgSettingsRequestDtoSchema = z.object({
  gameId: z.string(),
  token: z.string().optional().nullable(),
  userId: z.string(),
  currency: z.string(),
  language: z.string(),
  mode: z.enum(["real", "demo", "test"]),
  custom: customObjectSchema,
  userData: userDataObjectSchema,
});

// Schema for RTGSpinRequestDto
export const rtgSpinRequestDtoSchema = z.object({
  token: z.string().optional(),
  userId: z.string().optional(),
  gameId: z.string().optional(),
  stake: z.union([z.number(), z.string()]).optional(),
  currency: z.string().optional(),
  sessionId: z.string().optional(),
  playMode: z.enum(["real", "demo", "test"]).optional(),
  actions: z.array(z.any()).optional(),
  custom: customObjectSchema,
  bonusId: z.any().optional(),
  extras: z.any().optional(),
  siteId: z.string().optional(),
  userType: z.string().optional(),
  lang: z.union([z.string(), z.number()]).optional(),
  fingerprint: z.union([z.string(), z.number()]).optional(),
  channel: z.union([z.string(), z.number()]).optional(),
  affiliate: z.union([z.string(), z.number()]).optional(),
  userData: userDataObjectSchema,
  roundId: z.union([z.string(), z.number()]).optional(),
  transactionId: z.union([z.string(), z.number()]).optional(),
});
