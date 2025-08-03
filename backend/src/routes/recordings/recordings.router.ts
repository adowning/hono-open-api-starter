import { Hono } from 'hono'
import { recordingsController } from './recordings.controller'

const recordingsRouter = new Hono()

recordingsRouter.post('/upload', recordingsController.uploadRecording)

export default recordingsRouter
