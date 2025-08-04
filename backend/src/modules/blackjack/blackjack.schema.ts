/* SPDX-FileCopyrightText: 2025-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { z } from "zod";
import { messageSchema } from './utils/message.schema'
 
export const JoinMessage = messageSchema(
  "join",
  z.object({
    table: z.number().int(),
    seat: z.number().int().min(0).max(4),
  }),
);


/**
 * Client requests to place a bet on one or more seats.
 */
export const BetMessage = messageSchema(
  "bet",
  z.object({
    table: z.number().int(),
    bets: z.array(
      z.object({
        seat: z.number().int().min(0).max(4),
        amount: z.object({
          main: z.number().int().min(0),
          sideLeft: z.number().int().min(0),
          sideRight: z.number().int().min(0),
        }),
      }),
    ),
  }),
);

/**
 * Client requests to clear all their bets at a table.
 */
export const ClearMessage = messageSchema(
  "clear",
  z.object({
    table: z.number().int(),
  }),
);

/**
 * Client responds to an insurance offer.
 */
export const InsuranceMessage = messageSchema(
  "insurance",
  z.object({
    table: z.number().int(),
    insurance: z.boolean(),
  }),
);

/**
 * Client requests to "hit" (take another card).
 */
export const HitMessage = messageSchema(
  "hit",
  z.object({
    table: z.number().int(),
    seat: z.number().int().min(0).max(4),
  }),
);

/**
 * Client requests to "stand" (take no more cards).
 */
export const StandMessage = messageSchema(
  "stand",
  z.object({
    table: z.number().int(),
    seat: z.number().int().min(0).max(4),
  }),
);

/**
 * Client requests to "split" a pair.
 */
export const SplitMessage = messageSchema(
  "split",
  z.object({
    table: z.number().int(),
    seat: z.number().int().min(0).max(4),
  }),
);

/**
 * Client requests to "double down".
 */
export const DoubleMessage = messageSchema(
  "double",
  z.object({
    table: z.number().int(),
    seat: z.number().int().min(0).max(4),
  }),
);

// ============================================================================
// Server-to-Client Message Schemas
// ============================================================================

/**
 * Server broadcasts the initial state of all tables to a new client.
 */
export const InitMessage = messageSchema(
  "init",
  z.object({
    tables: z.array(z.any()), // Replace `z.any()` with a proper table schema if available
  }),
);

/**
 * Server broadcasts an update for a single table.
 */
export const TableUpdateMessage = messageSchema(
  "tableUpdate",
  z.object({
    table: z.any(), // Replace `z.any()` with a proper table schema if available
  }),
);

/**
 * Server sends a direct update to a user's data (e.g., balance change).
 */
export const UserUpdateMessage = messageSchema(
  "userUpdate",
  z.object({
    user: z.any(), // Replace `z.any()` with a proper user schema if available
  }),
);

export const ErrorMessage = messageSchema("error", z.object({ message: z.string() }));

