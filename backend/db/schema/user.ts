import { relations } from 'drizzle-orm'
import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { nanoid } from '../utils/nanoid'

// Enums
const UserRole = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    VIP: 'VIP',
    MODERATOR: 'MODERATOR',
    SYSTEM: 'SYSTEM',
    OWNER: 'OWNER',
    MEMBER: 'MEMBER',
    OPERATOR: 'OPERATOR',
    SUPPORT_AGENT: 'SUPPORT_AGENT',
} as const

const PaymentMethod = {
    INSTORE_CASH: 'INSTORE_CASH',
    INSTORE_CARD: 'INSTORE_CARD',
    CASH_APP: 'CASH_APP',
} as const

// Tables
export const operators = pgTable('operators', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    name: text('name').notNull().unique(),
    operatorSecret: text('operator_secret').notNull(),
    operatorAccess: text('operator_access').notNull(),
    callbackUrl: text('callback_url'),
    isActive: boolean('is_active').notNull().default(true),
    allowedIps: text('allowed_ips').array().notNull().default([]),
    description: text('description'),
    balance: integer('balance').notNull().default(0),
    netRevenue: integer('net_revenue').notNull().default(0),
    acceptedPayments: text('accepted_payments')
        .array()
        .notNull()
        .default(Object.values(PaymentMethod)),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const wallets = pgTable('wallets', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    balance: integer('balance').notNull().default(0),
    paymentMethod: text('payment_method')
        .notNull()
        .default(PaymentMethod.INSTORE_CASH),
    currency: text('currency').notNull().default('USD'),
    isActive: boolean('is_active').notNull().default(true),
    isDefault: boolean('is_default').notNull().default(false),
    address: text('address').unique(),
    cashtag: text('cashtag').unique(),
    userId: text('user_id').notNull(),
    operatorId: text('operator_id').notNull(),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const vipInfo = pgTable('vip_info', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    userId: text('user_id').notNull().unique(),
    currentLevel: integer('current_level').notNull().default(1),
    currentPoints: integer('current_points').notNull().default(0),
    pointsToNextLevel: integer('points_to_next_level').notNull().default(1000),
    totalPointsEarned: integer('total_points_earned').notNull().default(0),
    lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),
    benefits: text('benefits').array().notNull().default([]),
    status: text('status').notNull().default('ACTIVE'),
    operatorId: text('operator_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const users = pgTable('users', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    username: text('username').notNull().unique(),
    email: text('email').unique(),
    passwordHash: text('password_hash'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    avatar: text('avatar').default('default-avatar'),
    role: text('role').notNull().default(UserRole.USER),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at'),
    activeWalletId: text('active_wallet_id').references(() => wallets.id),
    vipInfoId: text('vip_info_id').references(() => vipInfo.id),
    operatorId: text('operator_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
})

// Relations
export const usersRelations = relations(users, ({ one }) => ({
    activeWallet: one(wallets, {
        fields: [users.activeWalletId],
        references: [wallets.id],
    }),
    vipInfo: one(vipInfo, {
        fields: [users.vipInfoId],
        references: [vipInfo.id],
    }),
    operator: one(operators, {
        fields: [users.operatorId],
        references: [operators.id],
    }),
}))

export const walletsRelations = relations(wallets, ({ one }) => ({
    user: one(users, {
        fields: [wallets.userId],
        references: [users.id],
    }),
    operator: one(operators, {
        fields: [wallets.operatorId],
        references: [operators.id],
    }),
}))

export const vipInfoRelations = relations(vipInfo, ({ one }) => ({
    user: one(users, {
        fields: [vipInfo.userId],
        references: [users.id],
    }),
    operator: one(operators, {
        fields: [vipInfo.operatorId],
        references: [operators.id],
    }),
}))

// Zod Schemas
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertWalletSchema = createInsertSchema(wallets)
export const selectWalletSchema = createSelectSchema(wallets)

export const insertVipInfoSchema = createInsertSchema(vipInfo)
export const selectVipInfoSchema = createSelectSchema(vipInfo)

export const insertOperatorSchema = createInsertSchema(operators)
export const selectOperatorSchema = createSelectSchema(operators)

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Wallet = typeof wallets.$inferSelect
export type NewWallet = typeof wallets.$inferInsert

export type VipInfo = typeof vipInfo.$inferSelect
export type NewVipInfo = typeof vipInfo.$inferInsert

export type Operator = typeof operators.$inferSelect
export type NewOperator = typeof operators.$inferInsert
