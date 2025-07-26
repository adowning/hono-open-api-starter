import configureOpenAPI from '#/lib/configure-open-api'
import createApp from '#/lib/create-app'
import auth from '#/routes/auth/auth.router'
import games from '#/routes/games/games.router'
import gamespins from '#/routes/gamespins/gamespins.router'
import index from '#/routes/index.route'
import operator from '#/routes/operator/operator.router'
import redtiger from '#/routes/redtiger/redtiger.router'
import users from '#/routes/user/user.router'
import updates from '#/routes/updates/updates.router'
import vip from '#/routes/vip/vip.router'
import wallet from '#/routes/wallet/wallet.router'
import websocket from '#/routes/websocket/websocket.router'
import { cors } from 'hono/cors'
import { updateGameSessionStats } from './lib/gameplay'

const app = createApp()
app.use(
    '*',
    cors({
        origin: [
            'http://localhost',
            'http://localhost:5173',
            'http://localhost:9999',
            'http://localhost:3001',
            'http://localhost:3000',
        ],
        allowHeaders: [
            'X-Custom-Header',
            'Authorization',
            'Content-Type',
            'Upgrade-Insecure-Requests',
        ],
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
        maxAge: 600,
        credentials: true,
    })
)
configureOpenAPI(app)

const routes = [
    auth,
    index,
    updates,
    users,
    redtiger,
    websocket,
    wallet,
    vip,
    operator,
    games,
    gamespins,
] as const

routes.forEach((route) => {
    app.route('/', route)
})

export type AppType = (typeof routes)[number]

export default app
