import { Scalar } from '@scalar/hono-api-reference'

import type { AppOpenAPI } from './types'

import packageJSON from '../../package.json'

export default function configureOpenAPI(app: AppOpenAPI) {
    app.doc('/doc', {
        openapi: '3.0.0',
        info: {
            version: packageJSON.version,
            title: 'Tasks API',
        },
    })

    app.get(
        '/reference',
        Scalar({
            url: '/doc',
            theme: 'kepler',
            authentication: {
                preferredSecurityScheme: 'httpBearer',
                securitySchemes: {
                    // apiKeyHeader: {
                    //     value: 'tokenValue'
                    // },
                    httpBearer: {
                        token: 'xyz token value'
                    },
                    // httpBasic: {
                    //     username: 'username',
                    //     password: 'password'
                    // },
                    // flows: {
                    //     authorizationCode: {
                    //         token: 'auth code token'
                    //     }
                    // }
                    // layout: "classic",
                    // defaultHttpClient: {
                    //     targetKey: 'js',
                    //     clientKey: 'fetch',
                    // },
                }
            }
        }
        )
    )
}
