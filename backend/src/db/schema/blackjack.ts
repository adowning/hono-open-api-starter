import {
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core'

import { nanoid } from '../../utils/nanoid'
import { users } from './schema'

export const BlackjackGame = pgTable('blackjack_games', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    table: integer('table').notNull(),
    type: text('type').notNull(),
    state: text('state').notNull(),
    deck: jsonb('deck'),
    dealerCards: jsonb('dealer_cards'),
    fair: jsonb('fair'),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow(),
})

export const BlackjackBet = pgTable('blackjack_bets', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    userId: varchar('user_id')
        .notNull()
        .references(() => users.id),
    gameId: varchar('game_id')
        .notNull()
        .references(() => BlackjackGame.id),
    seat: integer('seat').notNull(),
    amount: jsonb('amount').notNull(),
    cards: jsonb('cards'),
    cardsLeft: jsonb('cards_left'),
    cardsRight: jsonb('cards_right'),
    actions: jsonb('actions'),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
})

export const BlackjackMessage = pgTable('blackjack_message', {
    id: varchar('id').primaryKey().$defaultFn(nanoid),
    event: text('event'),
    requestId: text('request_id'),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
})
