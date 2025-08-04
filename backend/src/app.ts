import configureOpenAPI from '#/lib/configure-open-api'
import createApp from '#/lib/create-app'
import auth from '#/modules/auth/auth.router'
import game from '#/modules/games/games.router'
import gameService from '#/modules/gameService.route'
import gameSpin from '#/modules/gamespins/gamespins.router'
import index from '#/modules/index.route'
import redtiger from '#/modules/redtiger/redtiger.router'
import updates from '#/modules/updates/updates.router'
import wallet from '#/modules/wallet/wallet.router'
import users from '#/modules/user/user.router'
import vip from '#/modules/vip/vip.router'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'

const app = createApp()

/**
 * Dynamic CORS that reflects the exact allowed Origin and always enables credentials.
 * This is required so the browser accepts Set-Cookie on cross-site requests
 * (app.cashflowcasino.com -> api.cashflowcasino.com) for refresh_token.
 */
const allowedOrigins = new Set<string>([
    'http://localhost',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:9999',
    'http://localhost:3001',
    'http://localhost:3000',
    'https://slots.cashflowcasino.com',
    'https://app.cashflowcasino.com',
    'https://api.cashflowcasino.com',
])

app.use('*', cors({
    origin: (origin,) => {
        if (allowedOrigins.has(origin)) {
            return origin
        }
        return '' // Block by returning an empty string
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: [
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'Upgrade-Insecure-Requests',
        'Cache-Control',
        'Pragma'
    ],
    exposeHeaders: [
        'Content-Length',
        'X-Kuma-Revision'
    ],
    credentials: true,
    maxAge: 600,
    // preflight: (c) => {
    //     // Hono's cors middleware handles the 204 response for OPTIONS requests automatically
    //     return c.text('', 204)
    // }
}))
configureOpenAPI(app)

app.use('/*', serveStatic({ root: './public' }))

const modules = [
    auth,
    index,
    updates,
    users,
    redtiger,
    game,
    vip,
    gameSpin,
    wallet,
] as const

modules.forEach((route) => {
    app.route('/api/', route)
})

app.route('/gs2c/ge/v3/gameService/', gameService)



export type AppType = (typeof modules)[number]

export default app