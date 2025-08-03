import { randomUUID } from 'crypto'
import { WebSocket } from 'ws'

// --- CONFIGURATION ---
// Set the desired starting balance for the user in cents (e.g., 50000 = $500.00)
const INITIAL_WALLET_BALANCE_CENTS = 50000
// --- END CONFIGURATION ---

interface UserStats {
    wallet: {
        initialBalance: number
        finalBalance: number
        difference: number
    }
    vipInfo: {
        initialLevel: number
        finalLevel: number
        initialXp: number
        finalXp: number
        xpEarned: number
        bonusXpEarned: number
    }
    spins: {
        total: number
        totalWagered: number
        totalWon: number
        netResult: number
    }
}

interface SpinResult {
    success: boolean
    winAmount: number
    balance: number
    xpEarned: number
    error?: string
    sessionExpired?: boolean
}

interface GameSession {
    token: string
    sessionId: string
    fingerprint: string
    userId: string // Changed to string to match the API response
    gameId: string
    startTime: Date
    spins: Array<{
        spinId: string
        wager: number
        winAmount: number
        xpEarned: number
        timestamp: Date
    }>
}

// Function to perform a fetch request with a timeout
async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout = 5000
) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        })
        return response
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out')
        }
        throw error
    } finally {
        clearTimeout(id)
    }
}

async function createNewGameSession(): Promise<GameSession> {
    try {
        // First, ensure we have a valid access token
        const loginResponse = await fetchWithTimeout(
            'http://localhost:9999/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username:'asdf', //process.env.TEST_USERNAME || 'asdf',
                    password: 'asdfasdf'//process.env.TEST_PASSWORD || 'asdfasdf',
                }),
            },
            5000
        )

        if (!loginResponse.ok) {
            const errorText = await loginResponse.text()
            throw new Error(
                `Login failed: ${loginResponse.status} - ${errorText}`
            )
        }

        const loginData = await loginResponse.json()
        const accessToken = loginData.accessToken
        const user = loginData.user

        if (!user?.id) {
            throw new Error('Invalid user data in login response')
        }


        const sessionFingerprint = randomUUID()
        const payload = {
            token: null,
            sessionId: '0',
            playMode: 'demo',
            gameId: 'Atlantis',
            userId: user.id,
            currency: 'USD',
            language: 'en',
            mode: 'demo',
            userData: {
                userId: user.id,
                affiliate: '',
                lang: 'en',
                channel: 'I',
                userType: 'U',
                fingerprint: sessionFingerprint,
            },
            custom: {
                siteId: '',
                extras: '',
            },
        }

        console.log(
            'Sending game settings request with payload:',
            JSON.stringify(payload, null, 2)
        )

        const settingsResponse = await fetchWithTimeout(
            'http://localhost:9999/redtiger/game/settings',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            },
            10000
        )

        console.log('Game settings response status:', settingsResponse.ok)
        console.log('Game settings response status:', settingsResponse.status)

        if (!settingsResponse.ok) {
            const errorText = await settingsResponse.text()
            console.error('Game settings error response:', errorText)
            throw new Error(
                `Failed to create game session: ${settingsResponse.status} - ${errorText}`
            )
        }

        const response = await settingsResponse.json()
        console.log('Game settings response received ', response.success)

        // Check if the response has the expected format
        if (!response || !response.success || !response.result?.user) {
            throw new Error(
                'Invalid or unsuccessful response from game settings'
            )
        }

        const { token, sessionId, fingerprint } = response.result.user

        if (!token) {
            throw new Error('No session token received from game settings')
        }

        console.log(
            `New game session created successfully with token: ${token} and sessionId: ${sessionId}`
        )

        // Create and return the game session object
        return {
            token: token,
            sessionId: sessionId,
            fingerprint: fingerprint,
            userId: payload.userId,
            gameId: payload.gameId,
            startTime: new Date(),
            spins: [],
        }
    } catch (error) {
        console.error('Failed to create game session:', error)
        throw error
    }
}

// Global variables
let currentSession: GameSession | null = null
let spinData: Array<{
    wager: number
    win: number
    xp: number
    timestamp: Date
}> = []

// Main bot execution
async function runBot() {
    // Initialize game session
    try {
        currentSession = await createNewGameSession()
    } catch (error) {
        console.error('Failed to initialize game session:', error)
        process.exit(1)
    }

    const baseUrl = 'http://localhost:9999'
    let accessToken = ''
    let user: any = null
    let gameUserId: any = null
    let gameFingerprint: any = null

    // Track user stats
    const stats: UserStats = {
        wallet: {
            initialBalance: 0,
            finalBalance: 0,
            difference: 0,
        },
        vipInfo: {
            initialLevel: 0,
            finalLevel: 0,
            initialXp: 0,
            finalXp: 0,
            xpEarned: 0,
            bonusXpEarned: 0,
        },
        spins: {
            total: 5,
            totalWagered: 0,
            totalWon: 0,
            netResult: 0,
        },
    }

    let spinData: Array<{
        wager: number
        win: number
        xp: number
        timestamp: Date
    }> = []

    try {
        // 1. Login to get the initial access token
        console.log('Attempting to log in...')
        const loginResponse = await fetchWithTimeout(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'asdf', password: 'asdfasdf' }),
        })

        if (!loginResponse.ok) {
            console.error(`Login failed: ${loginResponse.status}`)
            return
        }

        const loginData = await loginResponse.json()
        accessToken = loginData.accessToken
        user = loginData.user
        console.log('Login successful.')

        // 2. Set the initial wallet balance
        console.log(
            `\nSetting initial wallet balance to $${(INITIAL_WALLET_BALANCE_CENTS / 100).toFixed(2)}...`
        )
        await fetchWithTimeout(`${baseUrl}/wallet/balance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'X-Game-Token': currentSession.token,
            },
            body: JSON.stringify({
                amount: INITIAL_WALLET_BALANCE_CENTS,
                type: 'credit',
                description: 'Bot Initial Balance',
            }),
        })

        // 3. Establish WebSocket connections
        console.log('\nConnecting to WebSockets...')
        const userWs = new WebSocket(
            `${baseUrl.replace('http', 'ws')}/ws/user?token=${accessToken}`
        )
        const notificationsWs = new WebSocket(
            `${baseUrl.replace('http', 'ws')}/ws/notifications?token=${accessToken}`
        )

        userWs.onopen = () => console.log(' User WebSocket connected.')
        notificationsWs.onopen = () =>
            console.log(' Notifications WebSocket connected.')
        userWs.onmessage = (event) => {
            try {
                const message = event.data.toString()
                console.log(message)
                const data = JSON.parse(message)
                if (data.wallet) {
                    if (stats.wallet.initialBalance === 0) {
                        stats.wallet.initialBalance = data.wallet.balance
                    } else {
                        stats.wallet.finalBalance = data.wallet.balance
                    }
                }
                if (data.vipInfo) {
                    if (stats.vipInfo.initialLevel === 0) {
                        stats.vipInfo.initialLevel = data.vipInfo.level || 1
                        stats.vipInfo.initialXp = data.vipInfo.xp || 0
                    } else {
                        stats.vipInfo.finalLevel = data.vipInfo.level || 1
                        stats.vipInfo.finalXp = data.vipInfo.xp || 0
                    }
                }
                console.log(' [USER UPDATE]:', message)
            } catch (error) {
                console.error('Error processing WebSocket message:', error)
            }
            console.log(' [USER UPDATE]:', event.data)
        }
        notificationsWs.onmessage = (event) => {
            try {
                const message = event.data.toString()
                console.log(' [NOTIFICATION]:', message)
            } catch (error) {
                console.error('Error processing notification:', error)
            }
        }
        userWs.onerror = (err) => console.error(' User WebSocket error:', err)
        notificationsWs.onerror = (err) =>
            console.error(' Notifications WebSocket error:', err)

        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 4. Perform spins using the data from the settings response
        for (let i = 1; i <= 5; i++) {
            console.log(`\n--- Performing Spin #${i} ---`)

            // Construct the detailed spin payload
            const spinPayload = {
                token: currentSession.token,
                sessionId: currentSession.sessionId, // Use the session token as sessionId
                playMode: 'demo',
                gameId: 'Atlantis',
                // Required root level fields
                userId: currentSession.userId,
                currency: 'USD',
                language: 'en',
                mode: 'demo',
                // Spin specific data
                stake: 1.0,
                lines: 20,
                lineBet: 0.05, // 1.0 / 20 lines
                // User data as an object
                userData: {
                    userId: currentSession.userId,
                    affiliate: '',
                    lang: 'en',
                    channel: 'I',
                    userType: 'U',
                    fingerprint: currentSession.fingerprint,
                },
                custom: {
                    siteId: '',
                    extras: '',
                },
                bonusId: null,
                extras: null,
                gameMode: 0,
            }

            const spinResponse = await fetchWithTimeout(
                `${baseUrl}/redtiger/game/spin`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(spinPayload),
                }
            )
            if (!spinResponse.ok) {
                console.error(
                    `Spin #${i} failed with status: ${spinResponse.status}.`
                )
                process.exit(1)
            }
            const spinDataResponse = await spinResponse.json()

            if (!spinResponse.ok || !spinDataResponse?.success) {
                console.error(
                    `Spin #${i} failed with status: ${spinResponse.status}.`
                )
                console.error('Response:', spinDataResponse)
                process.exit(1)
            }

            const winAmount = parseFloat(
                spinDataResponse.result?.game?.win?.total || '0'
            )
            console.log(
                `Spin ${spinDataResponse.result?.game?.spinId || 'N/A'}: ${winAmount > 0 ? 'WIN' : 'LOSE'} ${winAmount.toFixed(2)}`
            )

            // Track bonus XP
            if (spinDataResponse.result?.game?.xpBreakdown?.bonusXp > 0) {
                stats.vipInfo.bonusXpEarned += spinDataResponse.result.game.xpBreakdown.bonusXp;
            }

            // Store spin data for batch saving
            spinData.push({
                wager: 1.0,
                win: winAmount,
                xp: 0, // Will be updated when we get the user update
                timestamp: new Date(),
            })

            // Save spin data if we've reached the batch size
            if (spinData.length >= 10) {
                await saveSpinData()
            }

            // Update tracking
            stats.spins.totalWagered += 100 // Assuming 1.00 stake per spin
            stats.spins.totalWon += winAmount

            if (i < 5) {
                await new Promise((resolve) => setTimeout(resolve, 1500))
            }
        }
    } catch (err) {
        console.error('An error occurred during the bot execution:', err)
        process.exit(1)
    } finally {
        // Calculate final stats
        stats.wallet.difference =
            stats.wallet.finalBalance - stats.wallet.initialBalance
        stats.vipInfo.xpEarned = stats.vipInfo.finalXp - stats.vipInfo.initialXp
        stats.spins.netResult = stats.spins.totalWon - stats.spins.totalWagered

        // Print summary
        console.log('\n=== SPIN SESSION SUMMARY ===')
        console.log('\n WALLET:')
        console.log(
            `  Starting balance: $${(stats.wallet.initialBalance / 100).toFixed(2)}`
        )
        console.log(
            `  Final balance:    $${(stats.wallet.finalBalance / 100).toFixed(2)}`
        )
        console.log(
            `  Net change:       $${(stats.wallet.difference / 100).toFixed(2)} ${stats.wallet.difference >= 0 ? '' : ''}`
        )

        console.log('\n VIP STATUS:')
        console.log(
            `  Level: ${stats.vipInfo.initialLevel} → ${stats.vipInfo.finalLevel}`
        )
        console.log(
            `  XP:    ${stats.vipInfo.initialXp} → ${stats.vipInfo.finalXp} (${stats.vipInfo.xpEarned >= 0 ? '+' : ''}${stats.vipInfo.xpEarned})`
        )
        console.log(
            `  Bonus XP: ${stats.vipInfo.bonusXpEarned}`
        )

        console.log('\n SPIN STATISTICS:')
        console.log(`  Total spins:      ${stats.spins.total}`)
        console.log(
            `  Total wagered:    $${(stats.spins.totalWagered / 100).toFixed(2)}`
        )
        console.log(
            `  Total won:        $${(stats.spins.totalWon / 100).toFixed(2)}`
        )
        console.log(
            `  Net result:       $${(stats.spins.netResult / 100).toFixed(2)} ${stats.spins.netResult >= 0 ? ' Profit' : ' Loss'}`
        )
        console.log(
            `  RTP (Return to Player): ${((stats.spins.totalWon / stats.spins.totalWagered) * 100).toFixed(2)}%`
        )

        // Save any remaining spin data
        if (spinData.length > 0) {
            await saveSpinData()
        }

        console.log('\n Bot has finished its tasks.')
        // process.exit(0)
    }
}

runBot()

async function saveSpinData() {
    if (spinData.length === 0) return

    try {
        const payload = {
            spins: spinData,
            sessionId: currentSession?.token || 'no-session',
            timestamp: new Date().toISOString(),
        }

        console.log(`Saving batch of ${spinData.length} spins...`)

        // In a real implementation, you would send this to your batch endpoint
        // For now, we'll just log it
        console.log('Batch data:', JSON.stringify(payload, null, 2))

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        console.log('Spin data saved successfully')
        spinData = []
    } catch (error) {
        console.error('Failed to save spin data:', error)
        // In a real implementation, you might want to implement retry logic here
    }
}

// Function to ensure we have a valid session
async function ensureValidSession(): Promise<GameSession> {
    if (!currentSession) {
        currentSession = await createNewGameSession()
    }
    if (!currentSession) {
        throw new Error('Failed to create a valid game session')
    }
    return currentSession
}
