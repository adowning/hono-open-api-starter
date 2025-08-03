import { relations } from "drizzle-orm/relations";
import { authSessions, gameSessions, users, blackjackBets, blackjackGames, favoriteGames, games, gameHistory, jackpots, operators, products, gameSpins, jackpotWins, tournamentParticipants, wallets, rtgSettingsRequests, rtgSettingsRequestUserData, rtgSettingsRequestCustomData, rtgSettingsResponses, rtgSpinRequests, rtgSpinRequestUserData, rtgSpinRequestCustomData, vipInfo, vipRank, transactions, vipLevelUpHistory, rtgSpinResults, jackpotContributions } from "./schema";

export const gameSessionsRelations = relations(gameSessions, ({one}) => ({
	authSession: one(authSessions, {
		fields: [gameSessions.authSessionId],
		references: [authSessions.id]
	}),
	user: one(users, {
		fields: [gameSessions.userId],
		references: [users.id]
	}),
}));

export const authSessionsRelations = relations(authSessions, ({one, many}) => ({
	gameSessions: many(gameSessions),
	user: one(users, {
		fields: [authSessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	gameSessions: many(gameSessions),
	blackjackBets: many(blackjackBets),
	favoriteGames: many(favoriteGames),
	gameHistories: many(gameHistory),
	jackpots: many(jackpots),
	jackpotWins: many(jackpotWins),
	tournamentParticipants: many(tournamentParticipants),
	wallets: many(wallets),
	authSessions: many(authSessions),
	vipInfos: many(vipInfo),
}));

export const blackjackBetsRelations = relations(blackjackBets, ({one}) => ({
	user: one(users, {
		fields: [blackjackBets.userId],
		references: [users.id]
	}),
	blackjackGame: one(blackjackGames, {
		fields: [blackjackBets.gameId],
		references: [blackjackGames.id]
	}),
}));

export const blackjackGamesRelations = relations(blackjackGames, ({many}) => ({
	blackjackBets: many(blackjackBets),
}));

export const favoriteGamesRelations = relations(favoriteGames, ({one}) => ({
	user: one(users, {
		fields: [favoriteGames.userId],
		references: [users.id]
	}),
	game: one(games, {
		fields: [favoriteGames.gameId],
		references: [games.id]
	}),
}));

export const gamesRelations = relations(games, ({one, many}) => ({
	favoriteGames: many(favoriteGames),
	gameHistories: many(gameHistory),
	rtgSettingsResponses: many(rtgSettingsResponses),
	operator: one(operators, {
		fields: [games.operatorId],
		references: [operators.id]
	}),
	rtgSpinResults: many(rtgSpinResults),
}));

export const gameHistoryRelations = relations(gameHistory, ({one}) => ({
	user: one(users, {
		fields: [gameHistory.userId],
		references: [users.id]
	}),
	game: one(games, {
		fields: [gameHistory.gameId],
		references: [games.id]
	}),
}));

export const jackpotsRelations = relations(jackpots, ({one, many}) => ({
	user: one(users, {
		fields: [jackpots.lastWonBy],
		references: [users.id]
	}),
	jackpotWins: many(jackpotWins),
	jackpotContributions: many(jackpotContributions),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	operator: one(operators, {
		fields: [products.operatorId],
		references: [operators.id]
	}),
	transactions: many(transactions),
}));

export const operatorsRelations = relations(operators, ({many}) => ({
	products: many(products),
	games: many(games),
}));

export const jackpotWinsRelations = relations(jackpotWins, ({one}) => ({
	gameSpin: one(gameSpins, {
		fields: [jackpotWins.gameSpinId],
		references: [gameSpins.id]
	}),
	jackpot: one(jackpots, {
		fields: [jackpotWins.jackpotId],
		references: [jackpots.id]
	}),
	user: one(users, {
		fields: [jackpotWins.winnerId],
		references: [users.id]
	}),
}));

export const gameSpinsRelations = relations(gameSpins, ({many}) => ({
	jackpotWins: many(jackpotWins),
	jackpotContributions: many(jackpotContributions),
}));

export const tournamentParticipantsRelations = relations(tournamentParticipants, ({one}) => ({
	user: one(users, {
		fields: [tournamentParticipants.userId],
		references: [users.id]
	}),
}));

export const walletsRelations = relations(wallets, ({one, many}) => ({
	user: one(users, {
		fields: [wallets.userId],
		references: [users.id]
	}),
	transactions: many(transactions),
}));

export const rtgSettingsRequestUserDataRelations = relations(rtgSettingsRequestUserData, ({one}) => ({
	rtgSettingsRequest: one(rtgSettingsRequests, {
		fields: [rtgSettingsRequestUserData.requestId],
		references: [rtgSettingsRequests.id]
	}),
}));

export const rtgSettingsRequestsRelations = relations(rtgSettingsRequests, ({many}) => ({
	rtgSettingsRequestUserData: many(rtgSettingsRequestUserData),
	rtgSettingsRequestCustomData: many(rtgSettingsRequestCustomData),
}));

export const rtgSettingsRequestCustomDataRelations = relations(rtgSettingsRequestCustomData, ({one}) => ({
	rtgSettingsRequest: one(rtgSettingsRequests, {
		fields: [rtgSettingsRequestCustomData.requestId],
		references: [rtgSettingsRequests.id]
	}),
}));

export const rtgSettingsResponsesRelations = relations(rtgSettingsResponses, ({one}) => ({
	game: one(games, {
		fields: [rtgSettingsResponses.gameId],
		references: [games.id]
	}),
}));

export const rtgSpinRequestUserDataRelations = relations(rtgSpinRequestUserData, ({one}) => ({
	rtgSpinRequest: one(rtgSpinRequests, {
		fields: [rtgSpinRequestUserData.requestId],
		references: [rtgSpinRequests.id]
	}),
}));

export const rtgSpinRequestsRelations = relations(rtgSpinRequests, ({many}) => ({
	rtgSpinRequestUserData: many(rtgSpinRequestUserData),
	rtgSpinRequestCustomData: many(rtgSpinRequestCustomData),
}));

export const rtgSpinRequestCustomDataRelations = relations(rtgSpinRequestCustomData, ({one}) => ({
	rtgSpinRequest: one(rtgSpinRequests, {
		fields: [rtgSpinRequestCustomData.requestId],
		references: [rtgSpinRequests.id]
	}),
}));

export const vipInfoRelations = relations(vipInfo, ({one, many}) => ({
	user: one(users, {
		fields: [vipInfo.userId],
		references: [users.id]
	}),
	vipRank: one(vipRank, {
		fields: [vipInfo.currentRankid],
		references: [vipRank.id]
	}),
	vipLevelUpHistories: many(vipLevelUpHistory),
}));

export const vipRankRelations = relations(vipRank, ({many}) => ({
	vipInfos: many(vipInfo),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	product: one(products, {
		fields: [transactions.productId],
		references: [products.id]
	}),
	wallet: one(wallets, {
		fields: [transactions.walletId],
		references: [wallets.id]
	}),
}));

export const vipLevelUpHistoryRelations = relations(vipLevelUpHistory, ({one}) => ({
	vipInfo: one(vipInfo, {
		fields: [vipLevelUpHistory.vipInfoId],
		references: [vipInfo.id]
	}),
}));

export const rtgSpinResultsRelations = relations(rtgSpinResults, ({one}) => ({
	game: one(games, {
		fields: [rtgSpinResults.gameId],
		references: [games.id]
	}),
}));

export const jackpotContributionsRelations = relations(jackpotContributions, ({one}) => ({
	gameSpin: one(gameSpins, {
		fields: [jackpotContributions.gameSpinId],
		references: [gameSpins.id]
	}),
	jackpot: one(jackpots, {
		fields: [jackpotContributions.jackpotId],
		references: [jackpots.id]
	}),
}));