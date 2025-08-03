import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import z from 'zod'
import { authSessions, blackjackBets, blackjackGames, blackjackMessage, games, gameSessions, gameSpins, operators, products, tasks, updateType, users, vipInfo, vipLevel, vipRank, wallets } from './schema'

export const updateTypeSchema = z.enum(updateType.enumValues)

export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const selectWalletSchema = createSelectSchema(wallets)
export const selectAuthSessionSchema = createSelectSchema(authSessions)
export const selectGameSession = createSelectSchema(gameSessions)
export const newgameSessions = createInsertSchema(gameSessions)
export const selectVipInfoSchema = createSelectSchema(vipInfo)
export const selectOperatorSchema = createSelectSchema(operators)
export const selectGameSchema = createSelectSchema(games)
export const selectGameSpinSchema = createSelectSchema(gameSpins)
export const selectTasksSchema = createSelectSchema(tasks)
export const selectVipLevelSchema = createSelectSchema(vipLevel)
export const selectVipRankSchema = createSelectSchema(vipRank)

export const insertTasksSchema = createInsertSchema(tasks, {
    name: (schema) => schema.name.min(1).max(500),
})
    .required({
        done: true,
    })
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    })

export const patchTasksSchema = insertTasksSchema.partial()

export const productResponseSchema = createSelectSchema(products)
export const userResponseSchema = selectUserSchema.omit({
    passwordHash: true,
    refreshToken: true,
    accessToken: true,
    accessTokenExpiresAt: true,
    refreshTokenExpiresAt: true,
})
export const operatorsResponseSchema = selectOperatorSchema.omit({
    operatorSecret: true,
    operatorAccess: true,
})
export const walletResponseSchema = selectWalletSchema
export const vipInfoResponseSchema = selectVipInfoSchema
export const gameResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    title: z.string(),
    developer: z.string(),
    description: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    thumbnailUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    isActive: z.boolean().default(true),
})
export const gameCategorySchema = z.enum([
    'slots',
    'fish',
    'table',
    'live',
    'poker',
    'lottery',
    'virtual',
    'other',
])

export const userWithRelationsResponseSchema = userResponseSchema.extend({
    activewallet: walletResponseSchema.optional(),
    vipInfo: vipInfoResponseSchema.optional(),
})

export const gameSpinResponseSchema = z.object({
    id: z.string(),
    playerName: z.string().optional(),
    gamesName: z.string().optional(),
    spinData: z.record(z.any()).optional(),
    grossWinAmount: z.number(),
    wagerAmount: z.number(),
    spinNumber: z.number(),
    playerAvatar: z.string().optional(),
    currencyId: z.string().optional(),
    sessionId: z.string(),
    userId: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    occurredAt: z.string().datetime(),
    sessionDataId: z.string().optional(),
})

export const insertauthSessionsSchema = createInsertSchema(authSessions)
export const insertgameSessions = createInsertSchema(gameSessions)
export const AppVersionSchema = z.object({
    version: z.string(),
    platform: z.string(),
    updateType: updateTypeSchema,
    downloadUrl: z.string().url(),
    changelog: z.array(z.string()),
    mandatory: z.boolean(),
    releaseDate: z.string().datetime(),
    fileSize: z.number(),
    checksum: z.string(),
})
export const UpdateMetadataSchema = z.record(
    z.string(), // appId
    z.record(
        z.string(), // platform
        z.array(AppVersionSchema)
    )
)
export const CheckUpdateRequestSchema = z.object({
    currentVersion: z.string(),
    platform: z.string(),
    appId: z.string(),
    updateType: updateTypeSchema,
})
export const CheckUpdateResponseSchema = z.object({
    hasUpdate: z.boolean(),
    version: z.string().optional(),
    platform: z.string().optional(),
    updateType: updateTypeSchema.optional(),
    downloadUrl: z.string().url().optional(),
    changelog: z.array(z.string()).optional(),
    mandatory: z.boolean().optional(),
    releaseDate: z.string().datetime().optional(),
    fileSize: z.number().optional(),
    checksum: z.string().optional(),
})
export const ListVersionsResponseSchema = z.object({
    appId: z.string(),
    platform: z.string(),
    versions: z.array(AppVersionSchema),
})
export const SuccessResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    version: AppVersionSchema.optional(),
})
export const ErrorSchema = z.object({
    error: z.string(),
})

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
        serverTime: z.string().datetime({ message: 'Invalid ISO date string' }),
    }),
    games: z.object({
        version: z.string().optional(),
        gamesType: z.string().optional(),
    }).optional(),
    launcher: z.object({
        version: z.string().optional(),
    }).optional(),
    jackpots: z.any().optional(),
})
export const rtgSettingsResponseDtoSchema = z.object({
    success: z.boolean(),
    result: providerSettingsResponseDataSchema.optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
    }).optional(),
}).refine(data => data.success ? data.result !== undefined : data.error !== undefined, {
    message: 'If success is true, result must be provided. If false, error must be provided.',
})
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
        serverTime: z.string().datetime({ message: 'Invalid ISO date string' }),
        canGamble: z.boolean().optional(),
    }),
    games: z.object({
        win: z.object({
            instantWin: z.string().optional(),
            lines: z.string().optional(),
            total: z.string(),
        }),
        stake: z.string(),
        multiplier: z.number().optional(),
        winLines: z.array(z.any()).optional(),
        reelsBuffer: z.array(z.array(z.array(z.number()))).optional(),
        xpBreakdown: z.object({
            baseXp: z.number(),
            bonusXp: z.number(),
            totalXp: z.number(),
        }).optional(),
    }),
    jackpots: z.any().nullable().optional(),
    bonusChance: z.any().nullable().optional(),
})
export const rtgSpinResultSchema = providerSpinResponseDataSchema
export const rtgSpinResponseDtoSchema = z.object({
    success: z.boolean(),
    result: rtgSpinResultSchema.optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
    }).optional(),
}).refine(data => data.success ? data.result !== undefined : data.error !== undefined, {
    message: 'If success is true, result must be provided. If false, error must be provided.',
})
export const launchgamesResponseDtoSchema = z.object({
    launch_url: z.string().url(),
    games_session_id: z.string().optional(),
    launch_strategy: z.enum(['IFRAME', 'REDIRECT', 'POPUP']).optional(),
    provider_parameters: z.union([z.record(z.any(), z.any()), z.array(z.string()), z.string()]).optional(),
})
const customObjectSchema = z.object({
    siteId: z.string().optional(),
    extras: z.string().optional(),
}).optional()
const userDataObjectSchema = z.object({
    userId: z.union([z.string(), z.number()]).optional(),
    hash: z.string().optional(),
    affiliate: z.union([z.string(), z.number()]).optional(),
    lang: z.union([z.string(), z.number()]).optional(),
    channel: z.union([z.string(), z.number()]).optional(),
    userType: z.string().optional(),
    fingerprint: z.union([z.string(), z.number()]).optional(),
}).optional()
export const rtgSettingsRequestDtoSchema = z.object({
    gamesId: z.string(),
    token: z.string().optional().nullable(),
    userId: z.string(),
    currency: z.string(),
    language: z.string(),
    mode: z.enum(['real', 'demo', 'test']),
    custom: customObjectSchema,
    userData: userDataObjectSchema,
})
export const rtgSpinRequestDtoSchema = z.object({
    token: z.string().optional(),
    userId: z.string().optional(),
    gamesId: z.string().optional(),
    stake: z.union([z.number(), z.string()]).optional(),
    currency: z.string().optional(),
    sessionId: z.string().optional(),
    playMode: z.enum(['real', 'demo', 'test']).optional(),
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
})


export const selectblackjackGamesSchema = createSelectSchema(blackjackGames)
export const insertblackjackGamesSchema = createInsertSchema(blackjackGames)

export const selectblackjackBetsSchema = createSelectSchema(blackjackBets)
export const insertblackjackBetsSchema = createInsertSchema(blackjackBets)

export const blackjackMessageSchema = createSelectSchema(blackjackMessage)