import { eq } from 'drizzle-orm'

import db from '#/db'
import { Transaction, User, Wallet } from '#/db/schema'
import { triggerUserUpdate } from '#/lib/websocket.service'

/**
 * Debits a specified amount from a user's active wallet.
 * Throws an error if the user or wallet is not found, or if funds are insufficient.
 */
export async function debitFromWallet(userId: string, amountToDebit: number, description: string): Promise<void> {
    if (amountToDebit <= 0) {
        throw new Error('Debit amount must be positive.')
    }

    await db.transaction(async (tx) => {
        const user = await tx.query.User.findFirst({
            where: eq(User.id, userId),
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

        await tx.update(Wallet).set({ balance: newBalance }).where(eq(Wallet.id, wallet.id))

        await tx.insert(Transaction).values({
            walletId: wallet.id,
            userId,
            type: 'BET_PLACE',
            amount: amountToDebit,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            description,
        })
    })

    // After the transaction is successful, notify the client.
    await triggerUserUpdate(userId)
}

/**
 * Credits a specified amount to a user's active wallet.
 */
export async function creditToWallet(userId: string, amountToCredit: number, description: string): Promise<void> {
    if (amountToCredit <= 0) {
        return // No need to process zero or negative credits.
    }

    await db.transaction(async (tx) => {
        const user = await tx.query.User.findFirst({
            where: eq(User.id, userId),
            with: { activeWallet: true },
        })

        if (!user?.activeWallet) {
            throw new Error('Active wallet not found for user.')
        }

        const wallet = user.activeWallet
        const newBalance = wallet.balance + amountToCredit

        await tx.update(Wallet).set({ balance: newBalance }).where(eq(Wallet.id, wallet.id))

        await tx.insert(Transaction).values({
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
    await triggerUserUpdate(userId)
}
