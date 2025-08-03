import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type {
    rtgSettingsRequestCustomData,
    rtgSettingsRequests,
    rtgSettingsRequestUserData,
    rtgSettingsResultGame,
    rtgSettingsResults,
    rtgSettingsResultUser,
    rtgSettingsResultUserBalance,
    rtgSpinRequestCustomData,
    rtgSpinRequests,
    rtgSpinRequestUserData,
    rtgSpinResultGame,
    rtgSpinResultGameWin,
    rtgSpinResults,
    rtgSpinResultUser,
    rtgSpinResultUserBalance,
} from './rtg'
import type {
    appVersions,
    authSessions,
    games,
    gameSessions,
    gameSpins,
    inActiveWallets,
    jackpotContributions,
    jackpots,
    jackpotWins,
    operators,
    products,
    transactions,
    users,
    vipInfo,
    vipLevel,
    vipLevelUpHistory,
    vipRank,
    wallets,
} from './schema'

// SELECT Types - Used for querying data from the database
export type OperatorType = InferSelectModel<typeof operators>
export type WalletType = InferSelectModel<typeof wallets>
export type UserType = InferSelectModel<typeof users>
export type GameType = InferSelectModel<typeof games>
export type GameSpinType = InferSelectModel<typeof gameSpins>
export type InActiveWalletType = InferSelectModel<typeof inActiveWallets>
export type ProductType = InferSelectModel<typeof products>
export type TransactionType = InferSelectModel<typeof transactions>
export type VipRankType = InferSelectModel<typeof vipRank>
export type VipLevelType = InferSelectModel<typeof vipLevel>
export type VipInfoType = InferSelectModel<typeof vipInfo>
export type VipLevelUpHistoryType = InferSelectModel<typeof vipLevelUpHistory>
export type JackpotType = InferSelectModel<typeof jackpots>
export type JackpotContributionType = InferSelectModel<
    typeof jackpotContributions
>
export type JackpotWinType = InferSelectModel<typeof jackpotWins>
export type AuthSessionType = InferSelectModel<typeof authSessions>
export type GameSessionType = InferSelectModel<typeof gameSessions>
export type SelectRtgSettingsRequest = InferSelectModel<
    typeof rtgSettingsRequests
>
export type SelectRtgSettingsRequestusersData = InferSelectModel<
    typeof rtgSettingsRequestUserData
>
export type SelectRtgSettingsRequestCustomData = InferSelectModel<
    typeof rtgSettingsRequestCustomData
>
export type SelectRtgSpinRequest = InferSelectModel<typeof rtgSpinRequests>
export type SelectRtgSpinRequestusersData = InferSelectModel<
    typeof rtgSpinRequestUserData
>
export type SelectRtgSpinRequestCustomData = InferSelectModel<
    typeof rtgSpinRequestCustomData
>
export type SelectRtgSettingsResult = InferSelectModel<
    typeof rtgSettingsResults
>
export type SelectRtgSettingsResultusers = InferSelectModel<
    typeof rtgSettingsResultUser
>
export type SelectRtgSettingsResultusersBalance = InferSelectModel<
    typeof rtgSettingsResultUserBalance
>
export type SelectRtgSettingsResultgames = InferSelectModel<
    typeof rtgSettingsResultGame
>
export type SelectRtgSpinResult = InferSelectModel<typeof rtgSpinResults>
export type SelectRtgSpinResultusers = InferSelectModel<typeof rtgSpinResultUser>
export type SelectRtgSpinResultusersBalance = InferSelectModel<
    typeof rtgSpinResultUserBalance
>
export type SelectRtgSpinResultgames = InferSelectModel<typeof rtgSpinResultGame>
export type SelectRtgSpinResultgamesWin = InferSelectModel<
    typeof rtgSpinResultGameWin
>
export type AppVersion = InferSelectModel<typeof appVersions>

// INSERT Types - Used for inserting new data into the database
export type Newoperators = InferInsertModel<typeof operators>
export type Newwallets = InferInsertModel<typeof wallets>
export type Newusers = InferInsertModel<typeof users>
export type Newgames = InferInsertModel<typeof games>
export type NewgameSpins = InferInsertModel<typeof gameSpins>
export type NewinActiveWallets = InferInsertModel<typeof inActiveWallets>
export type Newproducts = InferInsertModel<typeof products>
export type Newtransactions = InferInsertModel<typeof transactions>
export type NewvipRank = InferInsertModel<typeof vipRank>
export type NewvipLevel = InferInsertModel<typeof vipLevel>
export type NewvipInfo = InferInsertModel<typeof vipInfo>
export type NewvipLevelUpHistory = InferInsertModel<typeof vipLevelUpHistory>
export type Newjackpots = InferInsertModel<typeof jackpots>
export type NewjackpotContributions = InferInsertModel<
    typeof jackpotContributions
>
export type NewjackpotWins = InferInsertModel<typeof jackpotWins>
export type NewauthSessions = InferInsertModel<typeof authSessions>
export type NewgamesSession = InferInsertModel<typeof gameSessions>
export type InsertRtgSettingsRequest = InferInsertModel<
    typeof rtgSettingsRequests
>
export type InsertRtgSpinRequest = InferInsertModel<typeof rtgSpinRequests>
export type InsertRtgSettingsResult = InferInsertModel<
    typeof rtgSettingsResults
>
export type InsertRtgSettingsResultgames = InferInsertModel<
    typeof rtgSettingsResultGame
>
export type InsertRtgSpinResult = InferInsertModel<typeof rtgSpinResults>

export type UserWithRelations = UserType & {
    activeWallet?: WalletType | null
    vipInfo: VipInfoType | null
    jackpotWins: JackpotWinType[]
    lastjackpotsWon: JackpotType[]
}

export type gamesWithRelations = GameType & {
    operator?: OperatorType | null
}

export type gameSpinsWithRelations = GameSpinType & {
    jackpotContributions: JackpotContributionType[]
    jackpotWins: JackpotWinType[]
}

export type operatorsWithRelations = OperatorType & {
    games: GameType[]
    products: ProductType[]
    wallets: WalletType[]
}

export type walletsWithRelations = WalletType & {
    operator: OperatorType
    transactions: TransactionType[]
    user: UserType[]
}

export type transactionsWithRelations = TransactionType & {
    jackpotWins: JackpotWinType[]
    product?: ProductType | null
    wallet?: WalletType | null
}

export type productsWithRelations = ProductType & {
    operator?: OperatorType | null
    transactions: TransactionType[]
}

export type vipRankWithRelations = VipRankType & {
    vipInfo: VipInfoType[]
}

export type vipInfoWithRelations = VipInfoType & {
    user: UserType
    history: VipLevelUpHistoryType[]
    currentRank?: VipRankType | null
}

export type vipLevelUpHistoryWithRelations = VipLevelUpHistoryType & {
    vipInfo: VipInfoType
}

export type jackpotsWithRelations = JackpotType & {
    contributions: JackpotContributionType[]
    wins: JackpotWinType[]
    lastWinner?: UserType | null
}

export type jackpotContributionsWithRelations = JackpotContributionType & {
    gameSpin: GameSpinType
    jackpot: JackpotType
}

export type jackpotWinsWithRelations = JackpotWinType & {
    gameSpin: GameSpinType
    jackpot: JackpotType
    transaction?: TransactionType | null
    winner: UserType
}

export type RtgSettingsRequestWithRelations = SelectRtgSettingsRequest & {
    userData?: SelectRtgSettingsRequestusersData
    customData?: SelectRtgSettingsRequestCustomData
}

export type RtgSpinRequestWithRelations = SelectRtgSpinRequest & {
    userData?: SelectRtgSpinRequestusersData
    customData?: SelectRtgSpinRequestCustomData
}

export type RtgSettingsResultusersWithRelations = SelectRtgSettingsResultusers & {
    balance?: SelectRtgSettingsResultusersBalance
}

export type RtgSpinResultusersWithRelations = SelectRtgSpinResultusers & {
    balance?: SelectRtgSpinResultusersBalance
}

export type RtgSpinResultgamesWithRelations = SelectRtgSpinResultgames & {
    win?: SelectRtgSpinResultgamesWin
}
