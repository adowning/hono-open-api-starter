// import { relations } from "drizzle-orm";
// import { boolean, decimal, doublePrecision, foreignKey, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, unique, uniqueIndex, varchar } from "drizzle-orm/pg-core";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// import z from "zod";

// import { nanoid } from "#/utils/nanoid";

// export const TournamentStatus = pgEnum("TournamentStatus", ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]);

// export const UserRole = pgEnum("UserRole", ["USER", "ADMIN", "MODERATOR", "SUPPORT", "BOT", "SYSTEM"]);

// export const SessionStatus = pgEnum("SessionStatus", ["ACTIVE", "COMPLETED", "ABANDONED", "EXPIRED"]);

// export const TypeOfJackpot = pgEnum("TypeOfJackpot", ["MINOR", "MAJOR", "GRAND"]);

// export const PaymentMethod = pgEnum("PaymentMethod", ["INSTORE_CASH", "INSTORE_CARD", "CASH_APP"]);

// export const TypeOfTransaction = pgEnum("TypeOfTransaction", ["DEPOSIT", "WITHDRAWAL", "BET", "WIN", "TRANSFER_SENT", "TRANSFER_RECEIVED", "SYSTEM_ADJUSTMENT_CREDIT", "SYSTEM_ADJUSTMENT_DEBIT", "TOURNAMENT_BUYIN", "TOURNAMENT_PRIZE", "AFFILIATE_COMMISSION", "REFUND", "FEE", "BONUS_AWARD", "BET_PLACE", "BET_WIN", "BET_LOSE", "BET_REFUND", "BONUS_WAGER", "BONUS_CONVERT", "BONUS_EXPIRED", "XP_AWARD", "ADJUSTMENT_ADD", "ADJUSTMENT_SUB", "INTERNAL_TRANSFER", "PRODUCT_PURCHASE", "REBATE_PAYOUT", "JACKPOT_WIN", "JACKPOT_CONTRIBUTION"]);

// export const TransactionStatus = pgEnum("TransactionStatus", ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED", "EXPIRED", "REJECTED", "REQUIRES_ACTION", "ON_HOLD"]);

// export const Role = pgEnum("Role", ["USER", "ADMIN", "VIP", "MODERATOR", "SYSTEM", "OWNER", "MEMBER", "OPERATOR", "SUPPORT_AGENT"]);

// export const GameCategory = pgEnum("game_categories", ["slots", "fish", "table", "live", "poker", "lottery", "virtual", "other"]);

// export const GameProviderName = pgEnum("GameProviderName", ["PRAGMATICPLAY", "EVOPLAY", "NETENT", "PLAYNGO", "RELAXGAMING", "HACKSAW", "BGAMING", "SPRIBE", "INTERNAL", "REDTIGER", "NETGAME", "BIGFISHGAMES", "CQNINE", "NOLIMIT", "KICKASS"]);

// export const Permission = pgEnum("Permission", ["read", "write", "upload", "manage_users", "manage_settings", "launch_game"]);

// export const UpdateType = pgEnum("UpdateType", ["BINARY", "OTA"]);

// export const Operator = pgTable("operators", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   name: text("name").notNull().unique(),
//   operatorSecret: text("operator_secret").notNull(),
//   operatorAccess: text("operator_access").notNull(),
//   callbackUrl: text("callback_url").notNull(),
//   isActive: boolean("is_active").notNull().default(true),
//   allowedIps: text("allowed_ips").array().notNull(),
//   description: text("description"),
//   balance: integer("balance").notNull(),
//   netRevenue: integer("net-revenue").notNull(),
//   acceptedPayments: PaymentMethod("accepted_payments").array().notNull(),
//   ownerId: text("owner_id"),
//   lastUsedAt: timestamp("last_used_at", { precision: 3 }),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
// });

// export const Wallet = pgTable("wallets", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   balance: integer("balance").notNull(),
//   paymentMethod: PaymentMethod("payment_method").notNull().default("INSTORE_CASH"),
//   currency: text("currency").notNull().default("USD"),
//   isActive: boolean("is_active").notNull().default(true),
//   isDefault: boolean("is_default").notNull(),
//   address: text("address").unique(),
//   cashtag: text("cashtag").unique(),
//   userId: text("user_id"),
//   operatorId: text("operator_id").notNull(),
//   lastUsedAt: timestamp("last_used_at", { precision: 3 }),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
// }, Wallet => ({
//   wallets_operator_fkey: foreignKey({
//     name: "wallets_operator_fkey",
//     columns: [Wallet.operatorId],
//     foreignColumns: [Operator.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const User = pgTable("users", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   username: text("username").notNull().unique(),
//   email: text("email").unique(),
//   passwordHash: text("password_hash"),
//   accessToken: text("access_token"),
//   refreshToken: text("refresh_token"),
//   accessTokenExpiresAt: timestamp("access_token_expires_at", { precision: 3 }),
//   refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { precision: 3 }),
//   currentGameSessionDataId: text("current_game_session_data_id").unique(),
//   currentAuthSessionDataId: text("current_auth_session_data_id").unique(),
//   avatar: text("avatar_url").default("avatar-01"),
//   role: UserRole("role").notNull().default("USER"),
//   isActive: boolean("is_active").notNull().default(true),
//   lastLoginAt: timestamp("last_login_at", { precision: 3 }),
//   totalXpGained: integer("total_xp_gained").notNull(),
//   activeWalletId: text("active_wallet_id").unique(),
//   vipInfoId: text("vip_info_id").unique(),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
//   deletedAt: timestamp("deleted_at", { precision: 3 }),
// }, User => ({
//   users_activeWallet_fkey: foreignKey({
//     name: "users_activeWallet_fkey",
//     columns: [User.activeWalletId],
//     foreignColumns: [Wallet.id],
//   })
//     .onDelete("set null")
//     .onUpdate("cascade"),
// }));
// export const insertUserSchema = createInsertSchema(User);
// export const selectUserSchema = createSelectSchema(User);

// export const Game = pgTable("games", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   name: text("name").notNull(),
//   title: text("title").notNull(),
//   goldsvetData: jsonb("goldsvet_data"),
//   description: text("description"),
//   category: GameCategory("category").notNull(),
//   tags: text("tags").array().notNull(),
//   thumbnailUrl: text("thumbnail_url"),
//   bannerUrl: text("banner_url"),
//   providerName: GameProviderName("provider_name").notNull(),
//   providerId: text("provider_id"),
//   totalWagered: integer("total_wagered").notNull(),
//   totalWon: integer("total_won").notNull(),
//   targetRtp: integer("target_rtp"),
//   isFeatured: boolean("is_featured").notNull(),
//   isActive: boolean("is_active").notNull().default(true),
//   operatorId: text("operator_id"),
//   tournamentDirectives: jsonb("tournament_directives"),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
// }, Game => ({
//   games_operator_fkey: foreignKey({
//     name: "games_operator_fkey",
//     columns: [Game.operatorId],
//     foreignColumns: [Operator.id],
//   })
//     .onDelete("set null")
//     .onUpdate("cascade"),
// }));

// export const GameSpin = pgTable("game_spins", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   playerName: text("player_name"),
//   gameName: text("game_name"),
//   spinData: jsonb("spin_data"),
//   grossWinAmount: doublePrecision("gross_win_amount").notNull(),
//   wagerAmount: doublePrecision("wager_amount").notNull(),
//   spinNumber: integer("spin_number").notNull(),
//   playerAvatar: text("player_avatar"),
//   currencyId: text("currency_id"),
//   sessionId: text("session_id").notNull(),
//   userId: text("user_id"),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
//   occurredAt: timestamp("occurred_at", { precision: 3 }).notNull(),
//   sessionDataId: text("sessionDataId"),
// });

// export const InActiveWallet = pgTable("in_active_wallets", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   balance: integer("balance").notNull(),
//   paymentMethod: PaymentMethod("payment_method").notNull().default("INSTORE_CASH"),
//   currency: text("currency").notNull().default("USD"),
//   isActive: boolean("is_active").notNull(),
//   isDefault: boolean("is_default").notNull(),
//   address: text("address").unique(),
//   cashtag: text("cashtag").unique(),
//   userId: text("user_id"),
//   operatorId: text("operator_id").notNull(),
//   lastUsedAt: timestamp("last_used_at", { precision: 3 }),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
// });
// export const SessionData = pgTable("sessions", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   endAt: timestamp("end_at", { precision: 3 }),
//   duration: integer("duration").notNull(),
//   totalWagered: integer("total_wagered").notNull(),
//   totalWon: integer("total_won").notNull(),
//   rtp: decimal("rtp", { precision: 65, scale: 30 }),
//   status: SessionStatus("status").notNull().default("ACTIVE"),
//   spinIds: text("spin_ids").array().notNull(),
//   currentBalance: integer("current_balance").notNull(),
//   userId: text("user_id").notNull(),
//   gameId: text("game_id").notNull(),
//   totalXpGained: integer("total_xp_gained").notNull(),
//   ipAddress: text("ip_address"),
//   userAgent: text("user_agent"),
//   deviceId: text("device_id"),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow(),
// }, SessionData => ({
//   sessions_user_fkey: foreignKey({
//     name: "sessions_user_fkey",
//     columns: [SessionData.userId],
//     foreignColumns: [User.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   sessions_game_fkey: foreignKey({
//     name: "sessions_game_fkey",
//     columns: [SessionData.gameId],
//     foreignColumns: [Game.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const Product = pgTable("products", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   title: text("title").notNull().default("default"),
//   productType: text("product_type").notNull().default("bundle"),
//   bonusTotalInCents: integer("bonus_total_in_credits").notNull(),
//   isActive: boolean("is_active"),
//   priceInCents: integer("price_in_cents").notNull(),
//   amountToReceiveInCents: integer("amount_to_receive_in_credits").notNull(),
//   bestValue: integer("best_value").notNull(),
//   discountInCents: integer("discount_in_cents").notNull(),
//   bonusSpins: integer("bonus_spins").notNull(),
//   isPromo: boolean("is_promo"),
//   totalDiscountInCents: integer("total_discount_in_cents").notNull(),
//   operatorId: text("operator_id"),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
// }, Product => ({
//   products_operator_fkey: foreignKey({
//     name: "products_operator_fkey",
//     columns: [Product.operatorId],
//     foreignColumns: [Operator.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const Transaction = pgTable("transactions", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   processedAt: timestamp("processed_at", { precision: 3 }),
//   walletId: text("wallet_id"),
//   type: TypeOfTransaction("type").notNull(),
//   status: TransactionStatus("status").notNull().default("PENDING"),
//   amount: integer("amount").notNull(),
//   netAmount: integer("net_amount"),
//   feeAmount: integer("fee_amount"),
//   productId: text("product_id"),
//   paymentMethod: PaymentMethod("payment_method"),
//   balanceBefore: integer("balance_before"),
//   balanceAfter: integer("balance_after"),
//   bonusBalanceBefore: integer("bonus_balance_before"),
//   bonusBalanceAfter: integer("bonus_balance_after"),
//   bonusAmount: integer("bonus_amount"),
//   wageringRequirement: integer("wagering_requirement"),
//   wageringProgress: integer("wagering_progress"),
//   description: text("description"),
//   provider: text("provider"),
//   providerTxId: text("provider_tx_id"),
//   relatedGameId: text("related_game_id"),
//   relatedRoundId: text("related_round_id"),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
//   operatorId: text("operator_id"),
//   userId: text("user_id"),
// }, Transaction => ({
//   transactions_product_fkey: foreignKey({
//     name: "transactions_product_fkey",
//     columns: [Transaction.productId],
//     foreignColumns: [Product.id],
//   })
//     .onDelete("set null")
//     .onUpdate("cascade"),
//   transactions_wallet_fkey: foreignKey({
//     name: "transactions_wallet_fkey",
//     columns: [Transaction.walletId],
//     foreignColumns: [Wallet.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const VipRank = pgTable("VipRank", {
//   id: integer("id").notNull().primaryKey(),
//   name: text("name").notNull().unique(),
//   minXp: integer("minXp").notNull().unique(),
//   dailyBonusCoinPct: integer("dailyBonusCoinPct").notNull(),
//   hourlyBonusCoinPct: integer("hourlyBonusCoinPct").notNull(),
//   purchaseBonusCoinPct: integer("purchaseBonusCoinPct").notNull(),
//   levelUpBonusCoinPct: integer("levelUpBonusCoinPct").notNull(),
//   hasConcierge: boolean("hasConcierge").notNull(),
//   hasVipLoungeAccess: boolean("hasVipLoungeAccess").notNull(),
//   isInvitationOnly: boolean("isInvitationOnly").notNull(),
// });

// export const VipLevel = pgTable("VipLevel", {
//   level: integer("level").notNull().primaryKey(),
//   xpForNext: integer("xpForNext").notNull(),
// });

// export const VipInfo = pgTable("vip_info", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   level: integer("level").notNull().default(1),
//   xp: integer("xp").notNull(),
//   totalXp: integer("totalXp").notNull(),
//   userId: text("userId").notNull().unique(),
//   currentRankid: integer("currentRankid"),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
// }, VipInfo => ({
//   vip_info_user_fkey: foreignKey({
//     name: "vip_info_user_fkey",
//     columns: [VipInfo.userId],
//     foreignColumns: [User.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   vip_info_currentRank_fkey: foreignKey({
//     name: "vip_info_currentRank_fkey",
//     columns: [VipInfo.currentRankid],
//     foreignColumns: [VipRank.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const BlackjackGame = pgTable("blackjack_games", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   deck: jsonb("deck").notNull(),
//   dealerCards: jsonb("dealerCards").notNull(),
//   fair: jsonb("fair").notNull(),
//   table: integer("table").notNull(),
//   type: text("type").notNull(),
//   state: text("state").notNull(),
//   updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
//   createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
// });

// export const BlackjackBet = pgTable("blackjack_bets", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   amount: jsonb("amount").notNull(),
//   payout: doublePrecision("payout"),
//   multiplier: doublePrecision("multiplier"),
//   cards: jsonb("cards").notNull(),
//   cardsLeft: jsonb("cardsLeft"),
//   cardsRight: jsonb("cardsRight"),
//   actions: text("actions").array().notNull(),
//   seat: integer("seat").notNull(),
//   gameId: text("gameId").notNull(),
//   userId: text("userId").notNull(),
//   updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
//   createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
// }, BlackjackBet => ({
//   blackjack_bets_game_fkey: foreignKey({
//     name: "blackjack_bets_game_fkey",
//     columns: [BlackjackBet.gameId],
//     foreignColumns: [BlackjackGame.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   blackjack_bets_user_fkey: foreignKey({
//     name: "blackjack_bets_user_fkey",
//     columns: [BlackjackBet.userId],
//     foreignColumns: [User.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const VipLevelUpHistory = pgTable("vip_level_up_history", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   previousLevel: integer("previous_level").notNull(),
//   newLevel: integer("new_level").notNull(),
//   timestamp: timestamp("timestamp", { precision: 3 }).notNull().defaultNow(),
//   vipInfoId: text("vip_info_id").notNull(),
// }, VipLevelUpHistory => ({
//   vip_level_up_history_vipInfo_fkey: foreignKey({
//     name: "vip_level_up_history_vipInfo_fkey",
//     columns: [VipLevelUpHistory.vipInfoId],
//     foreignColumns: [VipInfo.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const Jackpot = pgTable("jackpots", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   type: TypeOfJackpot("type").notNull(),
//   currentAmountCoins: integer("current_amount_coins").notNull(),
//   seedAmountCoins: integer("seed_amount_coins").notNull(),
//   minimumBetCoins: integer("minimum_bet_coins").notNull().default(1),
//   contributionRateBasisPoints: integer("contribution_rate_basis_points").notNull(),
//   probabilityPerMillion: integer("probability_per_million").notNull(),
//   minimumTimeBetweenWinsMinutes: integer("minimum_time_between_wins_minutes").notNull(),
//   lastWonAt: timestamp("last_won_at", { precision: 3 }),
//   lastWonBy: text("last_won_by"),
//   isActive: boolean("is_active").notNull().default(true),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
// }, Jackpot => ({
//   jackpots_lastWinner_fkey: foreignKey({
//     name: "jackpots_lastWinner_fkey",
//     columns: [Jackpot.lastWonBy],
//     foreignColumns: [User.id],
//   })
//     .onDelete("set null")
//     .onUpdate("cascade"),
// }));

// export const JackpotContribution = pgTable("jackpot_contributions", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   jackpotId: text("jackpot_id").notNull(),
//   userId: text("user_id"),
//   gameSpinId: text("game_spin_id").notNull(),
//   contributionAmountCoins: integer("contribution_amount_coins").notNull(),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
// }, JackpotContribution => ({
//   jackpot_contributions_gameSpin_fkey: foreignKey({
//     name: "jackpot_contributions_gameSpin_fkey",
//     columns: [JackpotContribution.gameSpinId],
//     foreignColumns: [GameSpin.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   jackpot_contributions_jackpot_fkey: foreignKey({
//     name: "jackpot_contributions_jackpot_fkey",
//     columns: [JackpotContribution.jackpotId],
//     foreignColumns: [Jackpot.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   JackpotContribution_jackpotId_gameSpinId_unique_idx: uniqueIndex("JackpotContribution_jackpotId_gameSpinId_key")
//     .on(JackpotContribution.jackpotId, JackpotContribution.gameSpinId),
// }));

// export const JackpotWin = pgTable("jackpot_wins", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   jackpotId: text("jackpot_id").notNull(),
//   winnerId: text("winner_id").notNull(),
//   winAmountCoins: integer("win_amount_coins").notNull(),
//   gameSpinId: text("game_spin_id").notNull().unique(),
//   transactionId: text("transaction_id"),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   sessionDataId: text("session_data_id"),
// }, JackpotWin => ({
//   jackpot_wins_gameSpin_fkey: foreignKey({
//     name: "jackpot_wins_gameSpin_fkey",
//     columns: [JackpotWin.gameSpinId],
//     foreignColumns: [GameSpin.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   jackpot_wins_jackpot_fkey: foreignKey({
//     name: "jackpot_wins_jackpot_fkey",
//     columns: [JackpotWin.jackpotId],
//     foreignColumns: [Jackpot.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   jackpot_wins_transaction_fkey: foreignKey({
//     name: "jackpot_wins_transaction_fkey",
//     columns: [JackpotWin.transactionId],
//     foreignColumns: [Transaction.id],
//   })
//     .onDelete("set null")
//     .onUpdate("cascade"),
//   jackpot_wins_winner_fkey: foreignKey({
//     name: "jackpot_wins_winner_fkey",
//     columns: [JackpotWin.winnerId],
//     foreignColumns: [User.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const Tournament = pgTable("tournaments", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   name: text("name").notNull(),
//   description: text("description"),
//   startTime: timestamp("start_time", { precision: 3 }).notNull(),
//   endTime: timestamp("end_time", { precision: 3 }),
//   targetScore: integer("target_score"),
//   status: TournamentStatus("status").notNull().default("PENDING"),
//   createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
//   updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
//   createdByid: text("created_by_id"),
//   userId: text("user_id"),
// });

// export const TournamentParticipant = pgTable("tournament_participants", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   tournamentId: text("tournament_id").notNull(),
//   userId: text("user_id").notNull(),
//   score: integer("score").notNull(),
//   rank: integer("rank"),
//   joinedAt: timestamp("joined_at", { precision: 3 }).notNull().defaultNow(),
// }, TournamentParticipant => ({
//   tournament_participants_tournament_fkey: foreignKey({
//     name: "tournament_participants_tournament_fkey",
//     columns: [TournamentParticipant.tournamentId],
//     foreignColumns: [Tournament.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   tournament_participants_user_fkey: foreignKey({
//     name: "tournament_participants_user_fkey",
//     columns: [TournamentParticipant.userId],
//     foreignColumns: [User.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   TournamentParticipant_tournamentId_userId_unique_idx: uniqueIndex("TournamentParticipant_tournamentId_userId_key")
//     .on(TournamentParticipant.tournamentId, TournamentParticipant.userId),
// }));

// export const TournamentGamePlay = pgTable("tournament_game_plays", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   tournamentParticipantId: text("tournament_participant_id").notNull(),
//   gameId: text("game_id").notNull(),
//   pointsEarned: integer("points_earned").notNull(),
//   playedAt: timestamp("played_at", { precision: 3 }).notNull().defaultNow(),
//   gameSessionId: text("game_session_id"),
// }, TournamentGamePlay => ({
//   tournament_game_plays_tournamentParticipant_fkey: foreignKey({
//     name: "tournament_game_plays_tournamentParticipant_fkey",
//     columns: [TournamentGamePlay.tournamentParticipantId],
//     foreignColumns: [TournamentParticipant.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const TournamentReward = pgTable("tournament_records", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   tournamentId: text("tournament_id").notNull(),
//   rank: integer("rank").notNull(),
//   description: text("description").notNull(),
//   isClaimed: boolean("is_claimed").notNull(),
//   winnerId: text("winner_id"),
// }, TournamentReward => ({
//   tournament_records_tournament_fkey: foreignKey({
//     name: "tournament_records_tournament_fkey",
//     columns: [TournamentReward.tournamentId],
//     foreignColumns: [Tournament.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const GameToTournament = pgTable("_GameToTournament", {
//   TournamentId: text("A").notNull(),
//   GameId: text("B").notNull(),
// }, GameToTournament => ({
//   _GameToTournament_Tournament_fkey: foreignKey({
//     name: "_GameToTournament_Tournament_fkey",
//     columns: [GameToTournament.TournamentId],
//     foreignColumns: [Tournament.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
//   _GameToTournament_Game_fkey: foreignKey({
//     name: "_GameToTournament_Game_fkey",
//     columns: [GameToTournament.GameId],
//     foreignColumns: [Game.id],
//   })
//     .onDelete("cascade")
//     .onUpdate("cascade"),
// }));

// export const SessionDataRelations = relations(SessionData, ({ one }) => ({
//   user: one(User, {
//     relationName: "SessionDataToUser",
//     fields: [SessionData.userId],
//     references: [User.id],
//   }),
//   game: one(Game, {
//     relationName: "GameToSessionData",
//     fields: [SessionData.gameId],
//     references: [Game.id],
//   }),
// }));

// export const UserRelations = relations(User, ({ one, many }) => ({
//   activeWallet: one(Wallet, {
//     relationName: "ActiveWallet",
//     fields: [User.activeWalletId],
//     references: [Wallet.id],
//   }),
//   vipInfo: many(VipInfo, {
//     relationName: "UserVipInfo",
//   }),
//   tournamentParticipations: many(TournamentParticipant, {
//     relationName: "TournamentParticipantToUser",
//   }),
//   sessions: many(SessionData, {
//     relationName: "SessionDataToUser",
//   }),
//   jackpotWins: many(JackpotWin, {
//     relationName: "JackpotWinToUser",
//   }),
//   lastJackpotWon: many(Jackpot, {
//     relationName: "JackpotLastWinner",
//   }),
//   BlackjackBet: many(BlackjackBet, {
//     relationName: "BlackjackBetToUser",
//   }),
// }));

// export const GameRelations = relations(Game, ({ one, many }) => ({
//   operator: one(Operator, {
//     relationName: "GameToOperator",
//     fields: [Game.operatorId],
//     references: [Operator.id],
//   }),
//   sessions: many(SessionData, {
//     relationName: "GameToSessionData",
//   }),
//   Tournament: many(GameToTournament, {
//     relationName: "GameToGameToTournament",
//   }),
// }));

// export const GameSpinRelations = relations(GameSpin, ({ many }) => ({
//   jackpotContributions: many(JackpotContribution, {
//     relationName: "GameSpinToJackpotContribution",
//   }),
//   jackpotWins: many(JackpotWin, {
//     relationName: "GameSpinToJackpotWin",
//   }),
// }));

// export const OperatorRelations = relations(Operator, ({ many }) => ({
//   games: many(Game, {
//     relationName: "GameToOperator",
//   }),
//   products: many(Product, {
//     relationName: "OperatorToProduct",
//   }),
//   wallets: many(Wallet, {
//     relationName: "OperatorToWallet",
//   }),
// }));

// export const WalletRelations = relations(Wallet, ({ one, many }) => ({
//   operator: one(Operator, {
//     relationName: "OperatorToWallet",
//     fields: [Wallet.operatorId],
//     references: [Operator.id],
//   }),
//   transactions: many(Transaction, {
//     relationName: "TransactionToWallet",
//   }),
//   user: many(User, {
//     relationName: "ActiveWallet",
//   }),
// }));

// export const TransactionRelations = relations(Transaction, ({ many, one }) => ({
//   jackpotWins: many(JackpotWin, {
//     relationName: "JackpotWinToTransaction",
//   }),
//   product: one(Product, {
//     relationName: "TransactionProduct",
//     fields: [Transaction.productId],
//     references: [Product.id],
//   }),
//   wallet: one(Wallet, {
//     relationName: "TransactionToWallet",
//     fields: [Transaction.walletId],
//     references: [Wallet.id],
//   }),
// }));

// export const ProductRelations = relations(Product, ({ one, many }) => ({
//   operator: one(Operator, {
//     relationName: "OperatorToProduct",
//     fields: [Product.operatorId],
//     references: [Operator.id],
//   }),
//   transactions: many(Transaction, {
//     relationName: "TransactionProduct",
//   }),
// }));

// export const VipRankRelations = relations(VipRank, ({ many }) => ({
//   VipInfo: many(VipInfo, {
//     relationName: "VipInfoToVipRank",
//   }),
// }));

// export const VipInfoRelations = relations(VipInfo, ({ one, many }) => ({
//   user: one(User, {
//     relationName: "UserVipInfo",
//     fields: [VipInfo.userId],
//     references: [User.id],
//   }),
//   history: many(VipLevelUpHistory, {
//     relationName: "VipInfoToVipLevelUpHistory",
//   }),
//   currentRank: one(VipRank, {
//     relationName: "VipInfoToVipRank",
//     fields: [VipInfo.currentRankid],
//     references: [VipRank.id],
//   }),
// }));

// export const BlackjackGameRelations = relations(BlackjackGame, ({ many }) => ({
//   bets: many(BlackjackBet, {
//     relationName: "BlackjackBetToBlackjackGame",
//   }),
// }));

// export const BlackjackBetRelations = relations(BlackjackBet, ({ one }) => ({
//   game: one(BlackjackGame, {
//     relationName: "BlackjackBetToBlackjackGame",
//     fields: [BlackjackBet.gameId],
//     references: [BlackjackGame.id],
//   }),
//   user: one(User, {
//     relationName: "BlackjackBetToUser",
//     fields: [BlackjackBet.userId],
//     references: [User.id],
//   }),
// }));

// export const VipLevelUpHistoryRelations = relations(VipLevelUpHistory, ({ one }) => ({
//   vipInfo: one(VipInfo, {
//     relationName: "VipInfoToVipLevelUpHistory",
//     fields: [VipLevelUpHistory.vipInfoId],
//     references: [VipInfo.id],
//   }),
// }));

// export const JackpotRelations = relations(Jackpot, ({ many, one }) => ({
//   contributions: many(JackpotContribution, {
//     relationName: "JackpotToJackpotContribution",
//   }),
//   wins: many(JackpotWin, {
//     relationName: "JackpotToJackpotWin",
//   }),
//   lastWinner: one(User, {
//     relationName: "JackpotLastWinner",
//     fields: [Jackpot.lastWonBy],
//     references: [User.id],
//   }),
// }));

// export const JackpotContributionRelations = relations(JackpotContribution, ({ one }) => ({
//   gameSpin: one(GameSpin, {
//     relationName: "GameSpinToJackpotContribution",
//     fields: [JackpotContribution.gameSpinId],
//     references: [GameSpin.id],
//   }),
//   jackpot: one(Jackpot, {
//     relationName: "JackpotToJackpotContribution",
//     fields: [JackpotContribution.jackpotId],
//     references: [Jackpot.id],
//   }),
// }));

// export const JackpotWinRelations = relations(JackpotWin, ({ one }) => ({
//   gameSpin: one(GameSpin, {
//     relationName: "GameSpinToJackpotWin",
//     fields: [JackpotWin.gameSpinId],
//     references: [GameSpin.id],
//   }),
//   jackpot: one(Jackpot, {
//     relationName: "JackpotToJackpotWin",
//     fields: [JackpotWin.jackpotId],
//     references: [Jackpot.id],
//   }),
//   transaction: one(Transaction, {
//     relationName: "JackpotWinToTransaction",
//     fields: [JackpotWin.transactionId],
//     references: [Transaction.id],
//   }),
//   winner: one(User, {
//     relationName: "JackpotWinToUser",
//     fields: [JackpotWin.winnerId],
//     references: [User.id],
//   }),
// }));

// export const TournamentRelations = relations(Tournament, ({ many }) => ({
//   participants: many(TournamentParticipant, {
//     relationName: "TournamentToTournamentParticipant",
//   }),
//   rewards: many(TournamentReward, {
//     relationName: "TournamentToTournamentReward",
//   }),
//   tournamentGames: many(GameToTournament, {
//     relationName: "TournamentToGameToTournament",
//   }),
// }));

// export const TournamentParticipantRelations = relations(TournamentParticipant, ({ many, one }) => ({
//   gamePlays: many(TournamentGamePlay, {
//     relationName: "TournamentGamePlayToTournamentParticipant",
//   }),
//   tournament: one(Tournament, {
//     relationName: "TournamentToTournamentParticipant",
//     fields: [TournamentParticipant.tournamentId],
//     references: [Tournament.id],
//   }),
//   user: one(User, {
//     relationName: "TournamentParticipantToUser",
//     fields: [TournamentParticipant.userId],
//     references: [User.id],
//   }),
// }));

// export const TournamentGamePlayRelations = relations(TournamentGamePlay, ({ one }) => ({
//   tournamentParticipant: one(TournamentParticipant, {
//     relationName: "TournamentGamePlayToTournamentParticipant",
//     fields: [TournamentGamePlay.tournamentParticipantId],
//     references: [TournamentParticipant.id],
//   }),
// }));

// export const TournamentRewardRelations = relations(TournamentReward, ({ one }) => ({
//   tournament: one(Tournament, {
//     relationName: "TournamentToTournamentReward",
//     fields: [TournamentReward.tournamentId],
//     references: [Tournament.id],
//   }),
// }));

// export const GameToTournamentRelations = relations(GameToTournament, ({ one }) => ({
//   Tournament: one(Tournament, {
//     relationName: "TournamentToGameToTournament",
//     fields: [GameToTournament.TournamentId],
//     references: [Tournament.id],
//   }),
//   Game: one(Game, {
//     relationName: "GameToGameToTournament",
//     fields: [GameToTournament.GameId],
//     references: [Game.id],
//   }),
// }));

// // =================================================================
// // Schema for RTG Settings Request
// // =================================================================

// export const rtgSettingsRequests = pgTable("rtg_settings_requests", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   token: text("token"),
//   sessionId: text("session_id").notNull(),
//   playMode: text("play_mode").notNull(),
//   gameId: text("game_id").notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const rtgSettingsRequestUserData = pgTable("rtg_settings_request_user_data", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   requestId: text("request_id").notNull().references(() => rtgSettingsRequests.id),
//   userId: text("user_id").notNull(),
//   hash: text("hash").notNull(),
//   affiliate: text("affiliate").notNull(),
//   lang: text("lang").notNull(),
//   channel: text("channel").notNull(),
//   userType: text("user_type").notNull(),
//   fingerprint: text("fingerprint").notNull(),
// });

// export const rtgSettingsRequestCustomData = pgTable("rtg_settings_request_custom_data", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   requestId: text("request_id").notNull().references(() => rtgSettingsRequests.id),
//   siteId: text("site_id").notNull(),
//   extras: text("extras").notNull(),
// });

// export const rtgSettingsRequestsRelations = relations(rtgSettingsRequests, ({ one }) => ({
//   userData: one(rtgSettingsRequestUserData, {
//     fields: [rtgSettingsRequests.id],
//     references: [rtgSettingsRequestUserData.requestId],
//   }),
//   customData: one(rtgSettingsRequestCustomData, {
//     fields: [rtgSettingsRequests.id],
//     references: [rtgSettingsRequestCustomData.requestId],
//   }),
// }));

// // =================================================================
// // Schema for RTG Spin Request
// // =================================================================

// export const rtgSpinRequests = pgTable("rtg_spin_requests", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   token: text("token").notNull(),
//   sessionId: text("session_id").notNull(),
//   playMode: text("play_mode").notNull(),
//   gameId: text("game_id").notNull(),
//   stake: integer("stake").notNull(),
//   bonusId: text("bonus_id"),
//   extras: text("extras"),
//   gameMode: integer("game_mode").notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const rtgSpinRequestUserData = pgTable("rtg_spin_request_user_data", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   requestId: text("request_id").notNull().references(() => rtgSpinRequests.id),
//   userId: integer("user_id").notNull(),
//   affiliate: text("affiliate").notNull(),
//   lang: text("lang").notNull(),
//   channel: text("channel").notNull(),
//   userType: text("user_type").notNull(),
//   fingerprint: text("fingerprint").notNull(),
// });

// export const rtgSpinRequestCustomData = pgTable("rtg_spin_request_custom_data", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   requestId: text("request_id").notNull().references(() => rtgSpinRequests.id),
//   siteId: text("site_id").notNull(),
//   extras: text("extras").notNull(),
// });

// export const rtgSpinRequestsRelations = relations(rtgSpinRequests, ({ one }) => ({
//   userData: one(rtgSpinRequestUserData, {
//     fields: [rtgSpinRequests.id],
//     references: [rtgSpinRequestUserData.requestId],
//   }),
//   customData: one(rtgSpinRequestCustomData, {
//     fields: [rtgSpinRequests.id],
//     references: [rtgSpinRequestCustomData.requestId],
//   }),
// }));

// // =================================================================
// // Schema for RTG Settings Response
// // =================================================================

// export const rtgSettingsResults = pgTable("rtg_settings_results", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   success: boolean("success").notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const rtgSettingsResultUser = pgTable("rtg_settings_result_user", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   settingsResultId: text("settings_result_id").notNull().references(() => rtgSettingsResults.id),
//   userId: integer("user_id").notNull(),
//   country: text("country").notNull(),
//   casino: text("casino").notNull(),
//   token: text("token").notNull(),
//   sessionId: text("session_id").notNull(),
//   canGamble: boolean("can_gamble").notNull(),
//   lastWin: decimal("last_win").notNull(),
//   serverTime: timestamp("server_time").notNull(),
// });

// export const rtgSettingsResultUserBalance = pgTable("rtg_settings_result_user_balance", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   settingsResultUserId: varchar("settings_result_user_id").notNull().references(() => rtgSettingsResultUser.id),
//   cash: decimal("cash").notNull(),
//   freeBets: decimal("free_bets").notNull(),
//   sessionCash: decimal("session_cash").notNull(),
//   sessionFreeBets: decimal("session_free_bets").notNull(),
//   bonus: decimal("bonus").notNull(),
// });

// export const rtgSettingsResultGame = pgTable("rtg_settings_result_game", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   settingsResultId: text("settings_result_id").notNull().references(() => rtgSettingsResults.id),
//   cols: integer("cols").notNull(),
//   rows: integer("rows").notNull(),
//   version: text("version").notNull(),
//   rtpDefault: decimal("rtp_default").notNull(),
//   volatilityIndex: decimal("volatility_index").notNull(),
//   maxMultiplier: decimal("max_multiplier").notNull(),
//   gameType: text("game_type").notNull(),
//   hasState: boolean("has_state").notNull(),
// });

// export const rtgSettingsResultsRelations = relations(rtgSettingsResults, ({ one }) => ({
//   user: one(rtgSettingsResultUser, { fields: [rtgSettingsResults.id], references: [rtgSettingsResultUser.settingsResultId] }),
//   game: one(rtgSettingsResultGame, { fields: [rtgSettingsResults.id], references: [rtgSettingsResultGame.settingsResultId] }),
// }));

// export const rtgSettingsResultUserRelations = relations(rtgSettingsResultUser, ({ one }) => ({
//   balance: one(rtgSettingsResultUserBalance, { fields: [rtgSettingsResultUser.id], references: [rtgSettingsResultUserBalance.settingsResultUserId] }),
// }));

// // =================================================================
// // Schema for RTG Spin Result
// // =================================================================

// export const rtgSpinResults = pgTable("rtg_spin_results", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   success: boolean("success").notNull(),
//   errorCode: integer("error_code"),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const rtgSpinResultUser = pgTable("rtg_spin_result_user", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   spinResultId: text("spin_result_id").notNull().references(() => rtgSpinResults.id),
//   canGamble: boolean("can_gamble").notNull(),
//   userId: integer("user_id").notNull(),
//   sessionId: text("session_id").notNull(),
//   sessionNetPosition: decimal("session_net_position").notNull(),
//   token: text("token").notNull(),
//   serverTime: timestamp("server_time").notNull(),
// });

// export const rtgSpinResultUserBalance = pgTable("rtg_spin_result_user_balance", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   spinResultUserId: varchar("spin_result_user_id").notNull().references(() => rtgSpinResultUser.id),
//   cashAtStart: decimal("cash_at_start").notNull(),
//   cashAfterBet: decimal("cash_after_bet").notNull(),
//   cashAtEnd: decimal("cash_at_end").notNull(),
//   freeBetsAtStart: decimal("free_bets_at_start").notNull(),
//   freeBetsAfterBet: decimal("free_bets_after_bet").notNull(),
//   freeBetsAtEnd: decimal("free_bets_at_end").notNull(),
//   bonusAtStart: decimal("bonus_at_start").notNull(),
//   bonusAfterBet: decimal("bonus_after_bet").notNull(),
//   bonusAtEnd: decimal("bonus_at_end").notNull(),
// });

// export const rtgSpinResultGame = pgTable("rtg_spin_result_game", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   spinResultId: text("spin_result_id").notNull().references(() => rtgSpinResults.id),
//   stake: decimal("stake").notNull(),
//   multiplier: integer("multiplier").notNull(),
//   hasState: boolean("has_state").notNull(),
// });

// export const rtgSpinResultGameWin = pgTable("rtg_spin_result_game_win", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   spinResultGameId: varchar("spin_result_game_id").notNull().references(() => rtgSpinResultGame.id),
//   lines: decimal("lines").notNull(),
//   total: decimal("total").notNull(),
// });

// export const rtgSpinResultRelations = relations(rtgSpinResults, ({ one }) => ({
//   user: one(rtgSpinResultUser, { fields: [rtgSpinResults.id], references: [rtgSpinResultUser.spinResultId] }),
//   game: one(rtgSpinResultGame, { fields: [rtgSpinResults.id], references: [rtgSpinResultGame.spinResultId] }),
// }));

// export const rtgSpinResultUserRelations = relations(rtgSpinResultUser, ({ one }) => ({
//   balance: one(rtgSpinResultUserBalance, { fields: [rtgSpinResultUser.id], references: [rtgSpinResultUserBalance.spinResultUserId] }),
// }));

// export const rtgSpinResultGameRelations = relations(rtgSpinResultGame, ({ one }) => ({
//   win: one(rtgSpinResultGameWin, { fields: [rtgSpinResultGame.id], references: [rtgSpinResultGameWin.spinResultGameId] }),
// }));

// export const tasks = pgTable("tasks", {
//   id: varchar("id").primaryKey().$defaultFn(nanoid),

//   name: text("name")
//     .notNull(),
//   done: boolean("done")
//     .notNull()
//     .default(false),
//   createdAt: timestamp("created_at")
//     .$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at")
//     .$defaultFn(() => new Date())
//     .$onUpdate(() => new Date()),
// });

// export const selectTasksSchema = createSelectSchema(tasks);

// export const insertTasksSchema = createInsertSchema(
//   tasks,
//   {
//     name: schema => schema.name.min(1).max(500),
//   },
// ).required({
//   done: true,
// }).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });

// export const patchTasksSchema = insertTasksSchema.partial();

// export const sessionStatusEnum = pgEnum("session_status", [
//   "ACTIVE",
//   "COMPLETED",
//   "EXPIRED",
// ]);

// export const AuthSession = pgTable(
//   "auth_sessions",
//   {
//     id: varchar("id").primaryKey().$defaultFn(nanoid),

//     userId: text("user_id")
//       .notNull()
//       .references(() => User.id, { onDelete: "cascade" }),
//     status: sessionStatusEnum("status").default("ACTIVE").notNull(),
//     ipAddress: text("ip_address"),
//     userAgent: text("user_agent"),
//     deviceId: text("device_id"),
//     createdAt: timestamp("created_at", { withTimezone: true })
//       .defaultNow()
//       .notNull(),
//     expiresAt: timestamp("expires_at", { withTimezone: true }),
//     lastSeen: timestamp("last_seen", { withTimezone: true })
//       .defaultNow()
//       .notNull(),
//   },
//   (table) => {
//     return {
//       userIdx: index("auth_session_user_idx").on(table.userId, table.createdAt),
//       statusIdx: index("auth_session_status_idx").on(table.status),
//     };
//   },
// );

// export const GameSession = pgTable(
//   "game_sessions",
//   {
//     id: varchar("id").primaryKey().$defaultFn(nanoid),

//     authSessionId: text("auth_session_id")
//       .notNull()
//       .references(() => AuthSession.id, { onDelete: "cascade" }),
//     userId: text("user_id")
//       .notNull()
//       .references(() => User.id, { onDelete: "cascade" }),
//     gameId: text("game_id").references(() => Game.id, { onDelete: "cascade" }),
//     status: sessionStatusEnum("status").default("ACTIVE").notNull(),
//     totalWagered: integer("total_wagered").default(0).notNull(),
//     totalWon: integer("total_won").default(0).notNull(),
//     totalXpGained: integer("total_xp_gained").default(0).notNull(),
//     rtp: decimal("rtp", { precision: 5, scale: 2 }),
//     duration: integer("duration").default(0).notNull(), // in seconds
//     createdAt: timestamp("created_at", { withTimezone: true })
//       .defaultNow()
//       .notNull(),
//     endedAt: timestamp("end_at", { withTimezone: true }),
//   },
//   (table) => {
//     return {
//       authSessionIdx: index("game_session_auth_session_idx").on(
//         table.authSessionId,
//       ),
//       userIdx: index("game_session_user_idx").on(table.userId),
//     };
//   },
// );

// export const authSessionsRelations = relations(AuthSession, ({ one, many }) => ({
//   user: one(User, {
//     fields: [AuthSession.userId],
//     references: [User.id],
//   }),
//   gameSessions: many(GameSession),
// }));

// export const gameSessionsRelations = relations(GameSession, ({ one }) => ({
//   authSession: one(AuthSession, {
//     fields: [GameSession.authSessionId],
//     references: [AuthSession.id],
//   }),
//   user: one(User, {
//     fields: [GameSession.userId],
//     references: [User.id],
//   }),
//   game: one(Game, {
//     fields: [GameSession.gameId],
//     references: [Game.id],
//   }),
// }));

// export const insertAuthSessionSchema = createInsertSchema(AuthSession);
// export const selectAuthSessionSchema
//   = createSelectSchema(AuthSession);

// export const insertGameSession = createInsertSchema(GameSession);
// export const selectGameSession
//   = createSelectSchema(GameSession);

// /**
//  * Enum for the different update types, corresponding to UpdateTypeSchema.
//  * This creates a custom type in your PostgreSQL database.
//  */
// export const updateTypeEnum = pgEnum("update_type", ["BINARY", "OTA"]);

// /**
//  * The main table for storing application versions.
//  * This is the database representation of your AppVersionSchema.
//  */
// export const appVersions = pgTable("app_versions", {
//   // A standard auto-incrementing primary key
//   id: serial("id").primaryKey(),

//   // Added based on the structure of UpdateMetadataSchema
//   appId: text("app_id").notNull(),

//   // --- Columns from AppVersionSchema ---
//   version: text("version").notNull(),
//   platform: text("platform").notNull(),
//   updateType: updateTypeEnum("update_type").notNull(),
//   downloadUrl: text("download_url").notNull(),

//   // PostgreSQL can store string arrays directly.
//   // For MySQL/SQLite, you would create a separate table for changelog entries.
//   changelog: text("changelog").array().notNull(),

//   mandatory: boolean("mandatory").default(false).notNull(),
//   releaseDate: timestamp("release_date", { withTimezone: true }).notNull(),
//   fileSize: integer("file_size").notNull(),
//   checksum: text("checksum").notNull(),
// }, (table) => {
//   // Add a unique constraint to ensure no duplicate versions exist
//   // for the same app and platform.
//   return {
//     versionUnique: unique("version_unique_idx").on(
//       table.appId,
//       table.platform,
//       table.version,
//     ),
//   };
// });

// export const UpdateTypeSchema = z.enum(["BINARY", "OTA"]);

// // Expanded schema for an application version
// export const AppVersionSchema = z.object({
//   version: z.string(),
//   platform: z.string(),
//   updateType: UpdateTypeSchema,
//   downloadUrl: z.string().url(),
//   changelog: z.array(z.string()),
//   mandatory: z.boolean(),
//   releaseDate: z.string().datetime(),
//   fileSize: z.number(),
//   checksum: z.string(),
// });

// // Metadata structure remains the same
// export const UpdateMetadataSchema = z.record(
//   z.string(), // appId
//   z.record(
//     z.string(), // platform
//     z.array(AppVersionSchema),
//   ),
// );

// // Enum to differentiate update types

// // Schema for the check-update request body now includes updateType
// export const CheckUpdateRequestSchema = z.object({
//   currentVersion: z.string(),
//   platform: z.string(),
//   appId: z.string(),
//   updateType: UpdateTypeSchema,
// });

// // Schema for the check-update response
// export const CheckUpdateResponseSchema = z.object({
//   hasUpdate: z.boolean(),
//   version: z.string().optional(),
//   platform: z.string().optional(),
//   updateType: UpdateTypeSchema.optional(),
//   downloadUrl: z.string().url().optional(),
//   changelog: z.array(z.string()).optional(),
//   mandatory: z.boolean().optional(),
//   releaseDate: z.string().datetime().optional(),
//   fileSize: z.number().optional(),
//   checksum: z.string().optional(),
// });

// // Schema for the list versions response
// export const ListVersionsResponseSchema = z.object({
//   appId: z.string(),
//   platform: z.string(),
//   versions: z.array(AppVersionSchema),
// });

// // Generic success/error schemas
// export const SuccessResponseSchema = z.object({
//   success: z.boolean(),
//   message: z.string(),
//   version: AppVersionSchema.optional(),
// });

// export const ErrorSchema = z.object({
//   error: z.string(),
// });

// export type UpdateTypeZ = z.infer<typeof UpdateTypeSchema>;
// export type AppVersion = z.infer<typeof AppVersionSchema>;
// export type UpdateMetadata = z.infer<typeof UpdateMetadataSchema>;
// export type CheckUpdateRequest = z.infer<typeof CheckUpdateRequestSchema>;
// export type CheckUpdateResponse = z.infer<typeof CheckUpdateResponseSchema>;
// export type ListVersionsResponse = z.infer<typeof ListVersionsResponseSchema>;

// // Schema for ProviderSettingsResponseData
// export const providerSettingsResponseDataSchema = z.object({
//   user: z.object({
//     balance: z.object({
//       cash: z.string(),
//       freeBets: z.string().optional(),
//       bonus: z.string().optional(),
//     }),
//     canGamble: z.boolean(),
//     userId: z.union([z.number(), z.string()]),
//     sessionId: z.string(),
//     sessionNetPosition: z.string().optional(),
//     token: z.string(),
//     country: z.string().optional(),
//     currency: z.object({
//       code: z.string(),
//       symbol: z.string(),
//     }).optional(),
//     stakes: z.any().optional(),
//     limits: z.any().optional(),
//     serverTime: z.string().datetime({ message: "Invalid ISO date string" }),
//   }),
//   game: z.object({
//     version: z.string().optional(),
//     gameType: z.string().optional(),
//   }).optional(),
//   launcher: z.object({
//     version: z.string().optional(),
//   }).optional(),
//   jackpots: z.any().optional(),
// });

// // Schema for RTGSettingsResponseDto
// export const rtgSettingsResponseDtoSchema = z.object({
//   success: z.boolean(),
//   result: providerSettingsResponseDataSchema.optional(),
//   error: z.object({
//     code: z.string(),
//     message: z.string(),
//     details: z.any().optional(),
//   }).optional(),
// }).refine(data => data.success ? data.result !== undefined : data.error !== undefined, {
//   message: "If success is true, result must be provided. If false, error must be provided.",
// });

// // --- Spin Schemas ---

// // Schema for ProviderSpinResponseData
// export const providerSpinResponseDataSchema = z.object({
//   transactions: z.object({
//     roundId: z.union([z.number(), z.string()]),
//   }),
//   user: z.object({
//     balance: z.object({
//       cash: z.object({
//         atStart: z.string().optional(),
//         afterBet: z.string().optional(),
//         atEnd: z.string(),
//       }),
//       freeBets: z.object({
//         atStart: z.string().optional(),
//         afterBet: z.string().optional(),
//         atEnd: z.string(),
//       }).optional(),
//       bonus: z.object({
//         atStart: z.string().optional(),
//         afterBet: z.string().optional(),
//         atEnd: z.string(),
//       }).optional(),
//     }),
//     userId: z.union([z.number(), z.string()]),
//     sessionId: z.string(),
//     sessionNetPosition: z.string().optional(),
//     token: z.string(),
//     serverTime: z.string().datetime({ message: "Invalid ISO date string" }),
//     canGamble: z.boolean().optional(),
//   }),
//   game: z.object({
//     win: z.object({
//       instantWin: z.string().optional(),
//       lines: z.string().optional(),
//       total: z.string(),
//     }),
//     stake: z.string(),
//     multiplier: z.number().optional(),
//     winLines: z.array(z.any()).optional(),
//     reelsBuffer: z.array(z.array(z.array(z.number()))).optional(),
//   }),
//   jackpots: z.any().nullable().optional(),
//   bonusChance: z.any().nullable().optional(),
// }); ;

// // Schema for RtgSpinResult (alias)
// export const rtgSpinResultSchema = providerSpinResponseDataSchema;

// // Schema for RTGSpinResponseDto
// export const rtgSpinResponseDtoSchema = z.object({
//   success: z.boolean(),
//   result: rtgSpinResultSchema.optional(),
//   error: z.object({
//     code: z.string(),
//     message: z.string(),
//     details: z.any().optional(),
//   }).optional(),
// }).refine(data => data.success ? data.result !== undefined : data.error !== undefined, {
//   message: "If success is true, result must be provided. If false, error must be provided.",
// });

// // --- Launch and Request Schemas ---

// // Schema for LaunchGameResponseDto
// export const launchGameResponseDtoSchema = z.object({
//   launch_url: z.string().url(),
//   game_session_id: z.string().optional(),
//   launch_strategy: z.enum(["IFRAME", "REDIRECT", "POPUP"]).optional(),
//   provider_parameters: z.union([z.record(z.any(), z.any()), z.array(z.string()), z.string()]).optional(),
// });

// // A reusable schema for custom and userData objects
// const customObjectSchema = z.object({
//   siteId: z.string().optional(),
//   extras: z.string().optional(),
// }).optional();

// const userDataObjectSchema = z.object({
//   userId: z.union([z.string(), z.number()]).optional(),
//   hash: z.string().optional(),
//   affiliate: z.union([z.string(), z.number()]).optional(),
//   lang: z.union([z.string(), z.number()]).optional(),
//   channel: z.union([z.string(), z.number()]).optional(),
//   userType: z.string().optional(),
//   fingerprint: z.union([z.string(), z.number()]).optional(),
// }).optional();

// // Schema for RTGSettingsRequestDto
// export const rtgSettingsRequestDtoSchema = z.object({
//   gameId: z.string(),
//   token: z.string().optional().nullable(),
//   userId: z.string(),
//   currency: z.string(),
//   language: z.string(),
//   mode: z.enum(["real", "demo", "test"]),
//   custom: customObjectSchema,
//   userData: userDataObjectSchema,
// });

// // Schema for RTGSpinRequestDto
// export const rtgSpinRequestDtoSchema = z.object({
//   token: z.string().optional(),
//   userId: z.string().optional(),
//   gameId: z.string().optional(),
//   stake: z.union([z.number(), z.string()]).optional(),
//   currency: z.string().optional(),
//   sessionId: z.string().optional(),
//   playMode: z.enum(["real", "demo", "test"]).optional(),
//   actions: z.array(z.any()).optional(),
//   custom: customObjectSchema,
//   bonusId: z.any().optional(),
//   extras: z.any().optional(),
//   siteId: z.string().optional(),
//   userType: z.string().optional(),
//   lang: z.union([z.string(), z.number()]).optional(),
//   fingerprint: z.union([z.string(), z.number()]).optional(),
//   channel: z.union([z.string(), z.number()]).optional(),
//   affiliate: z.union([z.string(), z.number()]).optional(),
//   userData: userDataObjectSchema,
//   roundId: z.union([z.string(), z.number()]).optional(),
//   transactionId: z.union([z.string(), z.number()]).optional(),
// });
