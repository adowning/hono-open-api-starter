import type { Context } from 'hono'
import { recordingsService } from './recordings.service'

export const recordingsController = {
    async uploadRecording(c: Context) {
        try {
            const body = await c.req.parseBody()
            const file = body.recording as File
            const sessionId = body.sessionId as string

            if (!file || !sessionId) {
                return c.json({ error: 'Missing recording file or session ID.' }, 400)
            }

            const result = await recordingsService.saveRecording(file, sessionId)
            return c.json(result)
        } catch (error) {
            console.error('Error uploading recording:', error)
            return c.json({ error: 'Failed to process recording upload.' }, 500)
        }
    },
}
