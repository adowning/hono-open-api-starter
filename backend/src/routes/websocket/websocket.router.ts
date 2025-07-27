import { createRouter } from '#/lib/create-app'

const router = createRouter()

// The route now accepts a topic parameter
router.get('/ws/:topic', (_c) => {
    return new Response('Upgrading to WebSocket', { status: 101 })
})

export default router
