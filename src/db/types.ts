import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { AuthSession, BlackjackBet, BlackjackGame, Game, GameSession, GameSpin, GameToTournament, InActiveWallet, Jackpot, JackpotContribution, JackpotWin, Operator, Product, rtgSettingsRequestCustomData, rtgSettingsRequests, rtgSettingsRequestUserData, rtgSettingsResultGame, rtgSettingsResults, rtgSettingsResultUser, rtgSettingsResultUserBalance, rtgSpinRequestCustomData, rtgSpinRequests, rtgSpinRequestUserData, rtgSpinResultGame, rtgSpinResultGameWin, rtgSpinResults, rtgSpinResultUser, rtgSpinResultUserBalance, SessionData, Tournament, TournamentGamePlay, TournamentParticipant, TournamentReward, Transaction, User, VipInfo, VipLevel, VipLevelUpHistory, VipRank, Wallet } from "./schema";

// SELECT Types - Used for querying data from the database
export type OperatorType = InferSelectModel<typeof Operator>;
export type WalletType = InferSelectModel<typeof Wallet>;
export type UserType = InferSelectModel<typeof User>;
export type GameType = InferSelectModel<typeof Game>;
export type GameSpinType = InferSelectModel<typeof GameSpin>;
export type InActiveWalletType = InferSelectModel<typeof InActiveWallet>;
export type SessionDataType = InferSelectModel<typeof SessionData>;
export type ProductType = InferSelectModel<typeof Product>;
export type TransactionType = InferSelectModel<typeof Transaction>;
export type VipRankType = InferSelectModel<typeof VipRank>;
export type VipLevelType = InferSelectModel<typeof VipLevel>;
export type VipInfoType = InferSelectModel<typeof VipInfo>;
export type BlackjackGameType = InferSelectModel<typeof BlackjackGame>;
export type BlackjackBetType = InferSelectModel<typeof BlackjackBet>;
export type VipLevelUpHistoryType = InferSelectModel<typeof VipLevelUpHistory>;
export type JackpotType = InferSelectModel<typeof Jackpot>;
export type JackpotContributionType = InferSelectModel<typeof JackpotContribution>;
export type JackpotWinType = InferSelectModel<typeof JackpotWin>;
export type TournamentType = InferSelectModel<typeof Tournament>;
export type TournamentParticipantType = InferSelectModel<typeof TournamentParticipant>;
export type TournamentGamePlayType = InferSelectModel<typeof TournamentGamePlay>;
export type TournamentRewardType = InferSelectModel<typeof TournamentReward>;
export type GameToTournamentType = InferSelectModel<typeof GameToTournament>;
export type AuthSessionType = InferSelectModel<typeof AuthSession>;
export type GameSessionType = InferSelectModel<typeof GameSession>;
export type SelectRtgSettingsRequest = InferSelectModel<typeof rtgSettingsRequests>;
export type SelectRtgSettingsRequestUserData = InferSelectModel<typeof rtgSettingsRequestUserData>;
export type SelectRtgSettingsRequestCustomData = InferSelectModel<typeof rtgSettingsRequestCustomData>;
export type SelectRtgSpinRequest = InferSelectModel<typeof rtgSpinRequests>;
export type SelectRtgSpinRequestUserData = InferSelectModel<typeof rtgSpinRequestUserData>;
export type SelectRtgSpinRequestCustomData = InferSelectModel<typeof rtgSpinRequestCustomData>;
export type SelectRtgSettingsResult = InferSelectModel<typeof rtgSettingsResults>;
export type SelectRtgSettingsResultUser = InferSelectModel<typeof rtgSettingsResultUser>;
export type SelectRtgSettingsResultUserBalance = InferSelectModel<typeof rtgSettingsResultUserBalance>;
export type SelectRtgSettingsResultGame = InferSelectModel<typeof rtgSettingsResultGame>;
export type SelectRtgSpinResult = InferSelectModel<typeof rtgSpinResults>;
export type SelectRtgSpinResultUser = InferSelectModel<typeof rtgSpinResultUser>;
export type SelectRtgSpinResultUserBalance = InferSelectModel<typeof rtgSpinResultUserBalance>;
export type SelectRtgSpinResultGame = InferSelectModel<typeof rtgSpinResultGame>;
export type SelectRtgSpinResultGameWin = InferSelectModel<typeof rtgSpinResultGameWin>;

// INSERT Types - Used for inserting new data into the database
export type NewOperator = InferInsertModel<typeof Operator>;
export type NewWallet = InferInsertModel<typeof Wallet>;
export type NewUser = InferInsertModel<typeof User>;
export type NewGame = InferInsertModel<typeof Game>;
export type NewGameSpin = InferInsertModel<typeof GameSpin>;
export type NewInActiveWallet = InferInsertModel<typeof InActiveWallet>;
export type NewSessionData = InferInsertModel<typeof SessionData>;
export type NewProduct = InferInsertModel<typeof Product>;
export type NewTransaction = InferInsertModel<typeof Transaction>;
export type NewVipRank = InferInsertModel<typeof VipRank>;
export type NewVipLevel = InferInsertModel<typeof VipLevel>;
export type NewVipInfo = InferInsertModel<typeof VipInfo>;
export type NewBlackjackGame = InferInsertModel<typeof BlackjackGame>;
export type NewBlackjackBet = InferInsertModel<typeof BlackjackBet>;
export type NewVipLevelUpHistory = InferInsertModel<typeof VipLevelUpHistory>;
export type NewJackpot = InferInsertModel<typeof Jackpot>;
export type NewJackpotContribution = InferInsertModel<typeof JackpotContribution>;
export type NewJackpotWin = InferInsertModel<typeof JackpotWin>;
export type NewTournament = InferInsertModel<typeof Tournament>;
export type NewTournamentParticipant = InferInsertModel<typeof TournamentParticipant>;
export type NewTournamentGamePlay = InferInsertModel<typeof TournamentGamePlay>;
export type NewTournamentReward = InferInsertModel<typeof TournamentReward>;
export type NewGameToTournament = InferInsertModel<typeof GameToTournament>;
export type NewAuthSession = InferInsertModel<typeof AuthSession>;
export type NewGameSession = InferInsertModel<typeof GameSession>;
export type InsertRtgSettingsRequest = InferInsertModel<typeof rtgSettingsRequests>;
export type InsertRtgSpinRequest = InferInsertModel<typeof rtgSpinRequests>;
export type InsertRtgSettingsResult = InferInsertModel<typeof rtgSettingsResults>;
export type InsertRtgSettingsResultGame = InferInsertModel<typeof rtgSettingsResultGame>;
export type InsertRtgSpinResult = InferInsertModel<typeof rtgSpinResults>;

// Relational Types - Includes the base schema and all possible relations
export type SessionDataWithRelations = SessionDataType & {
  user: UserType;
  game: GameType;
};

export type UserWithRelations = UserType & {
  activeWallet?: WalletType | null;
  vipInfo: VipInfoType[];
  tournamentParticipations: TournamentParticipantType[];
  sessions: SessionDataType[];
  jackpotWins: JackpotWinType[];
  lastJackpotWon: JackpotType[];
  BlackjackBet: BlackjackBetType[];
};

export type GameWithRelations = GameType & {
  operator?: OperatorType | null;
  sessions: SessionDataType[];
  Tournament: GameToTournamentType[];
};

export type GameSpinWithRelations = GameSpinType & {
  jackpotContributions: JackpotContributionType[];
  jackpotWins: JackpotWinType[];
};

export type OperatorWithRelations = OperatorType & {
  games: GameType[];
  products: ProductType[];
  wallets: WalletType[];
};

export type WalletWithRelations = WalletType & {
  operator: OperatorType;
  transactions: TransactionType[];
  user: UserType[];
};

export type TransactionWithRelations = TransactionType & {
  jackpotWins: JackpotWinType[];
  product?: ProductType | null;
  wallet?: WalletType | null;
};

export type ProductWithRelations = ProductType & {
  operator?: OperatorType | null;
  transactions: TransactionType[];
};

export type VipRankWithRelations = VipRankType & {
  VipInfo: VipInfoType[];
};

export type VipInfoWithRelations = VipInfoType & {
  user: UserType;
  history: VipLevelUpHistoryType[];
  currentRank?: VipRankType | null;
};

export type BlackjackGameWithRelations = BlackjackGameType & {
  bets: BlackjackBetType[];
};

export type BlackjackBetWithRelations = BlackjackBetType & {
  game: BlackjackGameType;
  user: UserType;
};

export type VipLevelUpHistoryWithRelations = VipLevelUpHistoryType & {
  vipInfo: VipInfoType;
};

export type JackpotWithRelations = JackpotType & {
  contributions: JackpotContributionType[];
  wins: JackpotWinType[];
  lastWinner?: UserType | null;
};

export type JackpotContributionWithRelations = JackpotContributionType & {
  gameSpin: GameSpinType;
  jackpot: JackpotType;
};

export type JackpotWinWithRelations = JackpotWinType & {
  gameSpin: GameSpinType;
  jackpot: JackpotType;
  transaction?: TransactionType | null;
  winner: UserType;
};

export type TournamentWithRelations = TournamentType & {
  participants: TournamentParticipantType[];
  rewards: TournamentRewardType[];
  tournamentGames: GameToTournamentType[];
};

export type TournamentParticipantWithRelations = TournamentParticipantType & {
  gamePlays: TournamentGamePlayType[];
  tournament: TournamentType;
  user: UserType;
};

export type TournamentGamePlayWithRelations = TournamentGamePlayType & {
  tournamentParticipant: TournamentParticipantType;
};

export type TournamentRewardWithRelations = TournamentRewardType & {
  tournament: TournamentType;
};

export type GameToTournamentWithRelations = GameToTournamentType & {
  Tournament: TournamentType;
  Game: GameType;
};

export type RtgSettingsRequestWithRelations = SelectRtgSettingsRequest & {
  userData?: SelectRtgSettingsRequestUserData;
  customData?: SelectRtgSettingsRequestCustomData;
};

export type RtgSpinRequestWithRelations = SelectRtgSpinRequest & {
  userData?: SelectRtgSpinRequestUserData;
  customData?: SelectRtgSpinRequestCustomData;
};

export type RtgSettingsResultUserWithRelations = SelectRtgSettingsResultUser & {
  balance?: SelectRtgSettingsResultUserBalance;
};

export type RtgSpinResultUserWithRelations = SelectRtgSpinResultUser & {
  balance?: SelectRtgSpinResultUserBalance;
};

export type RtgSpinResultGameWithRelations = SelectRtgSpinResultGame & {
  win?: SelectRtgSpinResultGameWin;
};
