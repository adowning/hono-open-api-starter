import type { AuthSessionType, GameSessionType, OperatorType, UserType, VipInfoType, WalletType } from '#/db'
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import type { Schema } from 'hono'
import type { PinoLogger } from 'hono-pino'

export interface AppBindings {
    Variables: {
        logger: PinoLogger;
        user: UserType,
        authSession: AuthSessionType
        gameSession: GameSessionType
        wallet: WalletType
        vipInfo: VipInfoType
        operator: OperatorType
    };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>
