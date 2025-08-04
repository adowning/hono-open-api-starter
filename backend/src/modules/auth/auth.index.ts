import { createRouter } from '#/lib/create-app'

import * as handlers from './auth.controller'
import * as routes from './auth.router'

const router = createRouter()
    .openapi(routes.login, handlers.login)

export default router
