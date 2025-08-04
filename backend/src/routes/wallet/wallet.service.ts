import { eq } from 'drizzle-orm'

import db from '#/db'
import { transactions, users, wallets } from '#/db/schema'
import { publishUserUpdated } from '#/lib/websocket.service'
import { nanoid } from 'nanoid'

/**
 * Debits a specified amount from a user's active wallet.
 * Throws an error if the user or wallet is not found, or if funds are insufficient.
 */
export async function debitFromwallets(userId: string, amountToDebit: number, description: string): Promise<void> {
    if (amountToDebit <= 0) {
        throw new Error('Debit amount must be positive.')
    }

    await db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({
            where: eq(users.id, userId),
            with: { activeWallet: true },
        })

        if (!user?.activeWallet) {
            throw new Error('Active wallet not found for user.')
        }

        const wallet = user.activeWallet

        if (wallet.balance < amountToDebit) {
            throw new Error('Insufficient funds.')
        }

        const newBalance = wallet.balance - amountToDebit

        await tx.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, wallet.id))
        const id = nanoid()
        await tx.insert(transactions).values({
            id,
            walletId: wallet.id,
            userId,
            type: 'BET_PLACE',
            amount: amountToDebit,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            description,
        })
    })

    // After the transaction is successful, notify the client with a wallet patch.
    publishUserUpdated(userId, {
        wallet: {
            // We do not know exact balance here without another query; client will refresh via snapshot if needed.
            // If you prefer an exact number, fetch the updated balance and include it.
        },
    })
}

/**
 * Credits a specified amount to a user's active wallet.
 */
export async function creditTowallets(userId: string, amountToCredit: number, description: string): Promise<void> {
    if (amountToCredit <= 0) {
        return // No need to process zero or negative credits.
    }

    await db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({
            where: eq(users.id, userId),
            with: { activeWallet: true },
        })

        if (!user?.activeWallet) {
            throw new Error('Active wallet not found for user.')
        }

        const wallet = user.activeWallet
        const newBalance = wallet.balance + amountToCredit

        await tx.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, wallet.id))
        const id = nanoid()

        await tx.insert(transactions).values({
            id,
            walletId: wallet.id,
            userId,
            type: 'BET_WIN',
            amount: amountToCredit,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            description,
        })
    })

    // After crediting, send an update to the client.
    publishUserUpdated(userId, {
        wallet: {
            // Optionally include balance or last transaction info
        },
    })
}
