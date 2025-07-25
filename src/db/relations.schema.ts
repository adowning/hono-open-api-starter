import { relations } from "drizzle-orm";

import { AuthSession, Game, GameSession, GameSpin, Jackpot, JackpotContribution, JackpotWin, Operator, Product, Transaction, User, VipInfo, VipLevelUpHistory, VipRank, Wallet } from "./slim.schema";

export const UserRelations = relations(User, ({ one, many }) => ({
  activeWallet: one(Wallet, {
    relationName: "ActiveWallet",
    fields: [User.activeWalletId],
    references: [Wallet.id],
  }),
  vipInfo: one(VipInfo, {
    relationName: "UserVipInfo",
    fields: [User.vipInfoId],
    references: [VipInfo.id],
  }),
  //   tournamentParticipations: many(TournamentParticipant, {
  //     relationName: "TournamentParticipantToUser",
  //   }),
  //   sessions: many(SessionData, {
  //     relationName: "SessionDataToUser",
  //   }),
  jackpotWins: many(JackpotWin, {
    relationName: "JackpotWinToUser",
  }),
  lastJackpotWon: many(Jackpot, {
    relationName: "JackpotLastWinner",
  }),
//   BlackjackBet: many(BlackjackBet, {
//     relationName: "BlackjackBetToUser",
//   }),
}));

export const GameRelations = relations(Game, ({ one }) => ({
  operator: one(Operator, {
    relationName: "GameToOperator",
    fields: [Game.operatorId],
    references: [Operator.id],
  }),
//   sessions: many(SessionData, {
//     relationName: "GameToSessionData",
//   }),
//   Tournament: many(GameToTournament, {
//     relationName: "GameToGameToTournament",
//   }),
}));

export const GameSpinRelations = relations(GameSpin, ({ many }) => ({
  jackpotContributions: many(JackpotContribution, {
    relationName: "GameSpinToJackpotContribution",
  }),
  jackpotWins: many(JackpotWin, {
    relationName: "GameSpinToJackpotWin",
  }),
}));

export const OperatorRelations = relations(Operator, ({ many }) => ({
  games: many(Game, {
    relationName: "GameToOperator",
  }),
  products: many(Product, {
    relationName: "OperatorToProduct",
  }),
  wallets: many(Wallet, {
    relationName: "OperatorToWallet",
  }),
}));

export const WalletRelations = relations(Wallet, ({ one, many }) => ({
  operator: one(Operator, {
    relationName: "OperatorToWallet",
    fields: [Wallet.operatorId],
    references: [Operator.id],
  }),
  transactions: many(Transaction, {
    relationName: "TransactionToWallet",
  }),
  user: many(User, {
    relationName: "ActiveWallet",
  }),
}));

export const VipRankRelations = relations(VipRank, ({ many }) => ({
  VipInfo: many(VipInfo, {
    relationName: "VipInfoToVipRank",
  }),
}));

export const VipInfoRelations = relations(VipInfo, ({ one, many }) => ({
  user: one(User, {
    relationName: "UserVipInfo",
    fields: [VipInfo.userId],
    references: [User.id],
  }),
  history: many(VipLevelUpHistory, {
    relationName: "VipInfoToVipLevelUpHistory",
  }),
  currentRank: one(VipRank, {
    relationName: "VipInfoToVipRank",
    fields: [VipInfo.currentRankid],
    references: [VipRank.id],
  }),
}));

export const VipLevelUpHistoryRelations = relations(VipLevelUpHistory, ({ one }) => ({
  vipInfo: one(VipInfo, {
    relationName: "VipInfoToVipLevelUpHistory",
    fields: [VipLevelUpHistory.vipInfoId],
    references: [VipInfo.id],
  }),
}));

export const JackpotRelations = relations(Jackpot, ({ many, one }) => ({
  contributions: many(JackpotContribution, {
    relationName: "JackpotToJackpotContribution",
  }),
  wins: many(JackpotWin, {
    relationName: "JackpotToJackpotWin",
  }),
  lastWinner: one(User, {
    relationName: "JackpotLastWinner",
    fields: [Jackpot.lastWonBy],
    references: [User.id],
  }),
}));

export const JackpotContributionRelations = relations(JackpotContribution, ({ one }) => ({
  gameSpin: one(GameSpin, {
    relationName: "GameSpinToJackpotContribution",
    fields: [JackpotContribution.gameSpinId],
    references: [GameSpin.id],
  }),
  jackpot: one(Jackpot, {
    relationName: "JackpotToJackpotContribution",
    fields: [JackpotContribution.jackpotId],
    references: [Jackpot.id],
  }),
}));

export const JackpotWinRelations = relations(JackpotWin, ({ one }) => ({
  gameSpin: one(GameSpin, {
    relationName: "GameSpinToJackpotWin",
    fields: [JackpotWin.gameSpinId],
    references: [GameSpin.id],
  }),
  jackpot: one(Jackpot, {
    relationName: "JackpotToJackpotWin",
    fields: [JackpotWin.jackpotId],
    references: [Jackpot.id],
  }),
  transaction: one(Transaction, {
    relationName: "JackpotWinToTransaction",
    fields: [JackpotWin.transactionId],
    references: [Transaction.id],
  }),
  winner: one(User, {
    relationName: "JackpotWinToUser",
    fields: [JackpotWin.winnerId],
    references: [User.id],
  }),
}));

export const authSessionsRelations = relations(AuthSession, ({ one, many }) => ({
  user: one(User, {
    fields: [AuthSession.userId],
    references: [User.id],
  }),
  gameSessions: many(GameSession),
}));

export const gameSessionsRelations = relations(GameSession, ({ one }) => ({
  authSession: one(AuthSession, {
    fields: [GameSession.authSessionId],
    references: [AuthSession.id],
  }),
  user: one(User, {
    fields: [GameSession.userId],
    references: [User.id],
  }),
  game: one(Game, {
    fields: [GameSession.gameId],
    references: [Game.id],
  }),
}));
