// // User type definition
// export interface User {
//   id: string
//   username: string
//   email: string | null
//   currentGameSessionDataId: string | null
//   currentAuthSessionDataId: string | null
//   avatar: string | null
//   role: string
//   isActive: boolean
//   lastLoginAt: string | null
//   totalXpGained: number
//   activeWalletId: string | null
//   vipInfoId: string | null
//   createdAt: string
//   updatedAt: string
//   deletedAt: string | null
// }

// // VIP related types
// export interface VipInfo {
//   id: string
//   level: number
//   currentXp: number
//   xpToNextLevel: number
//   progress: number
//   userId: string
//   createdAt: string
//   updatedAt: string
// }

// export interface VipLevel {
//   level: number
//   minXp: number
//   maxXp: number
//   bonus: number
//   cashback: number
//   rakeback: number
//   withdrawalLimit: number
//   dailyBonus: number
//   weeklyBonus: number
//   monthlyBonus: number
//   birthdayBonus: number
//   anniversaryBonus: number
//   color: string
//   icon: string
//   createdAt: string
//   updatedAt: string
// }

// // Game related types
// export interface Game {
//   id: string
//   name: string
//   description: string
//   thumbnail: string
//   categoryId: string
//   isActive: boolean
//   minBet: number
//   maxBet: number
//   rtp: number
//   volatility: 'LOW' | 'MEDIUM' | 'HIGH'
//   tags: string[]
//   createdAt: string
//   updatedAt: string
// }

// export interface GameCategory {
//   id: string
//   name: string
//   description: string
//   icon: string
//   isActive: boolean
//   order: number
//   createdAt: string
//   updatedAt: string
// }

// // Wallet related types
// export interface Wallet {
//   id: string
//   balance: number
//   currency: string
//   isActive: boolean
//   userId: string
//   createdAt: string
//   updatedAt: string
// }

// // API Response type
// export interface ApiResponse<T = unknown> {
//   data?: T
//   error?: {
//     message: string
//     code?: string
//   }
// }

// // RPC Client types
// export interface LoginCredentials {
//   username: string
//   password: string
// }

// export interface RpcClient {
//   // Auth
//   login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string }>>
//   getMe(): Promise<ApiResponse<{ user: User }>>

//   // VIP
//   getVipInfo(): Promise<ApiResponse<VipInfo>>
//   getVipLevels(): Promise<ApiResponse<VipLevel[]>>

//   // Games
//   getGames(): Promise<ApiResponse<Game[]>>
//   getGameCategories(): Promise<ApiResponse<GameCategory[]>>
//   enterGame(gameId: string): Promise<ApiResponse<{ url: string }>>

//   // Wallet
//   getWallet(): Promise<ApiResponse<Wallet>>

//   // Token management
//   setAuthToken(token: string | null): void
//   isAuthenticated(): boolean
//   logout(): void
// }
