import { Hono } from 'hono'
import { GameProxyService } from './proxy.service'

const router = new Hono()

// This route will accept the initial handshake request from the game client.
router.post('/EjsFrontWeb/fs', async (c) => {
    // The game sends the body as form data, so we parse it.
    const body = await c.req.parseBody()

    // We forward the request to the real server.
    const response = await GameProxyService.forwardRequest(body)

    // We return the real server's response back to the client.
    return c.json(response)
})

export default router
