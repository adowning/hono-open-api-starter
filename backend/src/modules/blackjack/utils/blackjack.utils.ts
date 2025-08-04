import crypto from 'node:crypto'
import Chance from 'chance'
import type { BlackjackTable, Player } from '../types'
import type { UserWithRelations } from '#/db/schema'

// --- Type Definitions ---

interface Card {
    rank: string;
    suit: string;
}







// --- Validation Functions ---

export function blackjackCheckSendJoinData(data: any): void {
    if (!data) {
        throw new Error('Something went wrong. Please try again in a few seconds.')
    }
    if (data.table === undefined || isNaN(data.table) || Math.floor(data.table) < 0) {
        throw new Error('Your entered table id is invalid.')
    }
    if (data.seat === undefined || isNaN(data.seat) || ![0, 1, 2, 3, 4].includes(data.seat)) {
        throw new Error('Your entered table seat is invalid.')
    }
}

export function blackjackCheckSendJoinTable(data: any, user: UserWithRelations, blackjackTable: BlackjackTable | undefined): void {
    if (!blackjackTable || !['created', 'countdown'].includes(blackjackTable.game.state)) {
        throw new Error('Your requested table is not available.')
    }
    if (blackjackTable.players.some(p => p.seat === data.seat)) {
        throw new Error('Your requested table seat is already occupied.')
    }
    if (blackjackTable.players.filter(p => p.user.id === user.id).length >= 3) {
        throw new Error('You aren’t allowed to sit at more than three seats at once.')
    }
    if (blackjackTable.players.some(p => p.user.id === user.id && !p.bet)) {
        throw new Error('You need to place a bet first on your other seats.')
    }
}

export function blackjackCheckSendJoinUser(user: UserWithRelations, blackjackTable: BlackjackTable): void {
    if (!user.activeWallet || user.activeWallet.balance < Math.floor(blackjackGetBetAmountMin(blackjackTable.game.type) * 1000)) {
        throw new Error('You do not have enough balance for this action.')
    }
}

export function blackjackCheckSendBetData(data: any): void {
    if (!data) {
        throw new Error('Something went wrong. Please try again in a few seconds.')
    }
    if (data.table === undefined || isNaN(data.table) || Math.floor(data.table) < 0) {
        throw new Error('Your entered table id is invalid.')
    }
    if (!data.bets || !Array.isArray(data.bets) || data.bets.length === 0) {
        throw new Error('Your provided bets are invalid.')
    }
}

export function blackjackCheckSendBetTable(blackjackTable: BlackjackTable | undefined): void {
    if (!blackjackTable || blackjackTable.game.state !== 'countdown') {
        throw new Error('Your requested table is not available.')
    }
}

export function blackjackCheckSendBetBets(bets: any[]): void {
    const checked: string[] = []
    for (const bet of bets) {
        if (!bet || !bet.amount) {
            throw new Error('You’ve provided an invalid bet amount.')
        }
        if (bet.seat === undefined || isNaN(bet.seat) || !['0', '1', '2', '3', '4'].includes(bet.seat.toString())) {
            throw new Error('Your provided table seat is invalid.')
        }
        if (isNaN(bet.amount.main) || Math.floor(bet.amount.main) < 0 ||
            isNaN(bet.amount.sideLeft) || Math.floor(bet.amount.sideLeft) < 0 ||
            isNaN(bet.amount.sideRight) || Math.floor(bet.amount.sideRight) < 0) {
            throw new Error('You’ve provided an invalid bet amount.')
        }
        if (checked.includes(bet.seat.toString())) {
            throw new Error('You’ve provided multiple bets for one seat.')
        }
        checked.push(bet.seat.toString())
    }
}

export function blackjackCheckSendBetSeat(bet: any, user: UserWithRelations, blackjackTable: BlackjackTable, blackjackSeat: Player | undefined): void {
    if (!blackjackSeat || blackjackSeat.user.id !== user.id) {
        throw new Error('Your requested table seat is not available.')
    }
    const minBet = Math.floor(blackjackGetBetAmountMin(blackjackTable.game.type) * 1000)
    const maxBet = Math.floor(blackjackGetBetAmountMax(blackjackTable.game.type) * 1000)
    const currentBetAmount = blackjackSeat.bet ? blackjackGetBetAmount(blackjackSeat.bet.amount) : 0
    const newBetAmount = blackjackGetBetAmount(bet.amount)

    if (newBetAmount <= 0) {
        throw new Error('You’ve provided an invalid bet amount.')
    }
    if (Object.values(bet.amount).some((amount: any) => amount > 0 && amount < minBet)) {
        throw new Error(`You can only bet a min amount of R$${(minBet / 1000).toFixed(2)} per seat.`)
    }
    if (currentBetAmount + newBetAmount > maxBet) {
        throw new Error(`You can only bet a total max amount of R$${(maxBet / 1000).toFixed(2)} per seat.`)
    }
    if ((bet.amount.sideLeft > 0 || bet.amount.sideRight > 0) && bet.amount.main <= 0 && !blackjackSeat.bet) {
        throw new Error('You need to place a main bet before you can place side bets.')
    }
    if (new Date().getTime() >= new Date(blackjackTable.game.updatedAt).getTime() + 10000) {
        throw new Error('Your requested table seat is not allowed to act.')
    }
}

export function blackjackCheckSendBetUser(user: UserWithRelations, amount: number): void {
    if (!user.activeWallet || user.activeWallet.balance < amount) {
        throw new Error('You don’t have enough balance for this action.')
    }
}

export function blackjackCheckSendClearData(data: any): void {
    if (!data || data.table === undefined || isNaN(data.table) || data.table < 0) {
        throw new Error('Invalid table specified.')
    }
}

export function blackjackCheckSendClearTable(table: BlackjackTable | undefined): void {
    if (!table || table.game.state !== 'countdown') {
        throw new Error('This table is not in a state to clear bets.')
    }
}

export function blackjackCheckSendClearSeat(table: BlackjackTable, seats: Player[]): void {
    if (seats.length === 0) {
        throw new Error('You have no bets to clear on this table.')
    }
    if (new Date().getTime() >= new Date(table.game.updatedAt).getTime() + 10000) {
        throw new Error('The betting phase has ended.')
    }
}

export function blackjackCheckSendInsuranceData(data: any): void {
    if (!data || typeof data.insurance !== 'boolean' || data.table === undefined || isNaN(data.table)) {
        throw new Error('Invalid insurance data provided.')
    }
}

export function blackjackCheckSendInsuranceTable(table: BlackjackTable | undefined): void {
    if (!table || table.game.state !== 'running') {
        throw new Error('This table is not in a state to accept insurance bets.')
    }
}

export function blackjackCheckSendInsuranceSeat(table: BlackjackTable, seat: Player | undefined): void {
    if (!seat) {
        throw new Error('You do not have a seat at this table.')
    }
    if (table.playersPos !== 'all' || new Date().getTime() >= new Date(table.game.updatedAt).getTime() + 10000) {
        throw new Error('It is not the time to make an insurance decision.')
    }
    if (seat.bet.actions.length > 1 || seat.bet.actions.includes('insurance') || seat.bet.actions.includes('noinsurance')) {
        throw new Error('You have already made an insurance decision.')
    }
}

export function blackjackCheckSendInsuranceUser(data: any, user: UserWithRelations, cost: number): void {
    if (data.insurance && (!user.activeWallet || user.activeWallet.balance < cost)) {
        throw new Error('You do not have enough balance to place insurance.')
    }
}

export function blackjackCheckSendHitData(data: any): void {
    if (!data || data.table === undefined || isNaN(data.table) || data.seat === undefined || isNaN(data.seat)) {
        throw new Error('Invalid hit data provided.')
    }
}

export function blackjackCheckSendHitTable(table: BlackjackTable | undefined): void {
    if (!table || table.game.state !== 'running') {
        throw new Error('This table is not in a state to be hit.')
    }
}

export function blackjackCheckSendHitSeat(user: UserWithRelations, table: BlackjackTable, seat: Player | undefined): void {
    if (!seat || seat.user.id !== user.id) {
        throw new Error('This is not your seat.')
    }
    if (table.playersPos !== seat.seat || new Date().getTime() >= new Date(table.game.updatedAt).getTime() + 10000) {
        throw new Error('It is not your turn to act.')
    }
    if (seat.bet.actions.includes('double')) {
        throw new Error('You cannot hit after doubling down.')
    }
    if (!seat.bet.actions.includes('split') && (seat.bet.actions.includes('stand') || blackjackGetCardsValue(seat.bet.cards) >= 21)) {
        throw new Error('You cannot hit.')
    }
}

export function blackjackCheckSendStandData(data: any): void {
    if (!data || data.table === undefined || isNaN(data.table) || data.seat === undefined || isNaN(data.seat)) {
        throw new Error('Invalid stand data provided.')
    }
}

export function blackjackCheckSendStandTable(table: BlackjackTable | undefined): void {
    if (!table || table.game.state !== 'running') {
        throw new Error('This table is not in a state to be stood on.')
    }
}

export function blackjackCheckSendStandSeat(user: UserWithRelations, table: BlackjackTable, seat: Player | undefined): void {
    if (!seat || seat.user.id !== user.id) {
        throw new Error('This is not your seat.')
    }
    if (table.playersPos !== seat.seat || new Date().getTime() >= new Date(table.game.updatedAt).getTime() + 10000) {
        throw new Error('It is not your turn to act.')
    }
    if (seat.bet.actions.includes('double') || (!seat.bet.actions.includes('split') && (seat.bet.actions.includes('stand') || blackjackGetCardsValue(seat.bet.cards) >= 21)) || (seat.bet.actions.includes('split') && (seat.bet.actions.filter((a: string) => a === 'stand').length >= 2 || (seat.bet.actions.includes('stand') && (blackjackGetCardsValue(seat.bet.cardsLeft) >= 21 || blackjackGetCardsValue(seat.bet.cardsRight) >= 21)) || (blackjackGetCardsValue(seat.bet.cardsLeft) >= 21 && blackjackGetCardsValue(seat.bet.cardsRight) >= 21)))) {
        throw new Error('You cannot stand.')
    }
}

export function blackjackCheckSendSplitData(data: any): void {
    if (!data || data.table === undefined || isNaN(data.table) || data.seat === undefined || isNaN(data.seat)) {
        throw new Error('Invalid split data provided.')
    }
}

export function blackjackCheckSendSplitTable(table: BlackjackTable | undefined): void {
    if (!table || table.game.state !== 'running') {
        throw new Error('This table is not in a state to be split.')
    }
}

export function blackjackCheckSendSplitSeat(user: UserWithRelations, table: BlackjackTable, seat: Player | undefined): void {
    if (!seat || seat.user.id !== user.id) {
        throw new Error('This is not your seat.')
    }
    if (table.playersPos !== seat.seat || new Date().getTime() >= new Date(table.game.updatedAt).getTime() + 10000) {
        throw new Error('It is not your turn to act.')
    }
    if (seat.bet.actions.includes('split')) {
        throw new Error('You have already split.')
    }
    if (seat.bet.cards.length !== 2 || seat.bet.cards[0].rank !== seat.bet.cards[1].rank) {
        throw new Error('You cannot split these cards.')
    }
}

export function blackjackCheckSendSplitUser(user: UserWithRelations, seat: Player): void {
    const betAmount = 'amountMain' in seat.bet ? seat.bet.amountMain : seat.bet.amount.main
    if (!user.activeWallet || user.activeWallet.balance < betAmount) {
        throw new Error('You do not have enough balance to split.')
    }
}

export function blackjackCheckSendDoubleData(data: any): void {
    if (!data || data.table === undefined || isNaN(data.table) || data.seat === undefined || isNaN(data.seat)) {
        throw new Error('Invalid double down data provided.')
    }
}

export function blackjackCheckSendDoubleTable(table: BlackjackTable | undefined): void {
    if (!table || table.game.state !== 'running') {
        throw new Error('This table is not in a state to be doubled down on.')
    }
}

export function blackjackCheckSendDoubleSeat(user: UserWithRelations, table: BlackjackTable, seat: Player | undefined): void {
    if (!seat || seat.user.id !== user.id) {
        throw new Error('This is not your seat.')
    }
    if (table.playersPos !== seat.seat || new Date().getTime() >= new Date(table.game.updatedAt).getTime() + 10000) {
        throw new Error('It is not your turn to act.')
    }
    if (seat.bet.actions.includes('split')) {
        throw new Error('You cannot double down after splitting.')
    }
    if (seat.bet.cards.length !== 2 || blackjackGetCardsValue(seat.bet.cards) < 9 || blackjackGetCardsValue(seat.bet.cards) > 11) {
        throw new Error('You can only double down with a hand value of 9, 10, or 11.')
    }
}

export function blackjackCheckSendDoubleUser(user: UserWithRelations, seat: Player): void {
    const betAmount = 'amountMain' in seat.bet ? seat.bet.amountMain : seat.bet.amount.main
    if (!user.activeWallet || user.activeWallet.balance < betAmount) {
        throw new Error('You do not have enough balance to double down.')
    }
}

// --- Game Logic Functions ---

const cardRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const cardSuits = ['heart', 'spade', 'diamond', 'club']

export function blackjackGenerateDeck(): Card[] {
    const deck: Card[] = []
    const deckCount = Number.parseInt(process.env.BLACKJACK_DEDECK_COUNT!, 10) || 1
    for (let d = 0; d < deckCount; d++) {
        for (const suit of cardSuits) {
            for (const rank of cardRanks) {
                deck.push({ rank, suit })
            }
        }
    }
    return deck
}

export function blackjackShuffleDeck(deck: Card[], combinedSeed: string): Card[] {
    const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex')
    const chance = new Chance(hash)
    return chance.shuffle(deck)
}

export function blackjackGetCardsValue(cards: Card[]): number {
    let value = 0
    let aceCount = 0
    for (const card of cards) {
        if (card.rank === 'A') {
            aceCount++
            value += 11
        } else if (['K', 'Q', 'J'].includes(card.rank)) {
            value += 10
        } else {
            value += Number.parseInt(card.rank, 10)
        }
    }
    while (value > 21 && aceCount > 0) {
        value -= 10
        aceCount--
    }
    return value
}

export function blackjackCheckCardsSoftSeventeen(cards: Card[]): boolean {
    let value = 0
    let hasAce = false
    for (const card of cards) {
        if (card.rank === 'A') {
            hasAce = true
            value += 1
        } else if (['K', 'Q', 'J'].includes(card.rank)) {
            value += 10
        } else {
            value += Number.parseInt(card.rank, 10)
        }
    }
    return hasAce && value === 7
}

export function blackjackGetBetAmountMin(type: string): number {
    return type === 'whale'
        ? Number.parseFloat(process.env.BLACKJACK_MIN_AMOUNT_WHALE!)
        : Number.parseFloat(process.env.BLACKJACK_MIN_AMOUNT_STANDARD!)
}

export function blackjackGetBetAmountMax(type: string): number {
    return type === 'whale'
        ? Number.parseFloat(process.env.BLACKJACK_MAX_AMOUNT_WHALE!)
        : Number.parseFloat(process.env.BLACKJACK_MAX_AMOUNT_STANDARD!)
}

export function blackjackGetBetAmount(amount: any): number {
    // Handle both Prisma BlackjackBet and local BetAmount types
    if ('amountMain' in amount) {
        // Prisma BlackjackBet
        return Math.floor((amount.amountMain || 0) + (amount.amountSideLeft || 0) + (amount.amountSideRight || 0))
    } else if ('main' in amount) {
        // Local BetAmount
        return Math.floor((amount.main || 0) + (amount.sideLeft || 0) + (amount.sideRight || 0))
    } else {
        // If we have a nested structure
        return Math.floor((amount.amount?.main || 0) + (amount.amount?.sideLeft || 0) + (amount.amount?.sideRight || 0))
    }
}



// --- Sanitization Functions ---

export function blackjackTableListSanitize(tables: BlackjackTable[]): any[] {
    return tables.map(table => blackjackTableSanitize(table))
}

export function blackjackTableSanitize(table: BlackjackTable): any {
    const sanitized = JSON.parse(JSON.stringify(table))

    if (sanitized.game.state !== 'completed') {
        delete sanitized.game.deck
        delete sanitized.game.seedServer
        if (sanitized.game.state === 'running' && sanitized.game.dealerCards.length > 1) {
            sanitized.game.dealerCards[1] = { rank: 'hidden', suit: 'hidden' }
        }
    }

    for (const player of sanitized.players) {
        // This should be replaced with a proper user sanitization function
        player.user = {
            id: player.user.id,
            username: player.user.username,
            avatar: player.user.avatar,
            rank: player.user.rank,
            level: player.user.level,
        }
    }

    return sanitized
}