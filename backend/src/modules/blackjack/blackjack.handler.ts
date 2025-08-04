/* SPDX-FileCopyrightText: 2025-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import db from '#/db'
import type { UserWithRelations } from '#/db/schema'
import { users } from '#/db/schema'
import type { ServerWebSocket } from 'bun'
import { eq } from 'drizzle-orm'
import type { WebSocketData } from '../websocket/websocket.handler'
import {
    BetMessage,
    ClearMessage,
    DoubleMessage,
    HitMessage,
    InsuranceMessage,
    JoinMessage,
    SplitMessage,
    StandMessage,
} from './blackjack.schema'
import {
    blackjackGetData,
    blackjackSendBetSocket,
    blackjackSendClearSocket,
    blackjackSendDoubleSocket,
    blackjackSendHitSocket,
    blackjackSendInsuranceSocket,
    blackjackSendJoinSocket,
    blackjackSendSplitSocket,
    blackjackSendStandSocket,
} from './blackjack.service'
import { settingCheck } from './utils/setting'
import {
    socketAddConnectionLimit,
    socketCheckAntiSpam,
    socketCheckUserData,
    socketRemoveAntiSpam,
    socketRemoveConnectionLimit,
} from './utils/socket'

async function handleMessage(
    ws: ServerWebSocket<WebSocketData>,
    msg: any,
    controllerFunction: any
) {
    if (!ws.data.user) {
        ws.send(
            JSON.stringify({
                type: 'error',
                payload: { message: 'You need to sign in.' },
            })
        )
        return
    }

    try {
        await socketCheckAntiSpam(ws.data.user.id)

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, ws.data.user.id))
        socketCheckUserData(user as UserWithRelations, true)
        settingCheck()

        const result = await controllerFunction(user, msg.payload)

        if (result.broadcasts) {
            for (const broadcast of result.broadcasts) {
                ws.publish(
                    broadcast.topic,
                    JSON.stringify({
                        type: broadcast.schema.type,
                        payload: broadcast.payload,
                    })
                )
            }
        }

        if (result.direct) {
            ws.send(
                JSON.stringify({
                    type: result.direct.schema.type,
                    payload: result.direct.payload,
                })
            )
        }

        ws.send(
            JSON.stringify({ type: msg.schema.type, payload: result.response })
        )
    } catch (err: any) {
        socketRemoveAntiSpam(ws.data.user.id)
        ws.send(
            JSON.stringify({ type: 'error', payload: { message: err.message } })
        )
    }
}

export const blackjackHandler = {
    open(ws: ServerWebSocket<WebSocketData>) {
        const identifier = `${ws.remoteAddress}`
        socketAddConnectionLimit('blackjack', identifier)
        ws.subscribe('blackjack')
        const initData = blackjackGetData()
        ws.send(
            JSON.stringify({
                type: 'init',
                payload: { tables: initData.tables },
            })
        )
    },
    message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
        try {
            const msg = JSON.parse(message.toString())
            switch (msg.type) {
                case 'join':
                    handleMessage(
                        ws,
                        { payload: msg.payload, schema: JoinMessage },
                        blackjackSendJoinSocket
                    )
                    break
                case 'bet':
                    handleMessage(
                        ws,
                        { payload: msg.payload, schema: BetMessage },
                        blackjackSendBetSocket
                    )
                    break
                case 'clear':
                    handleMessage(
                        ws,
                        { payload: msg.payload, schema: ClearMessage },
                        blackjackSendClearSocket
                    )
                    break
                case 'insurance':
                    handleMessage(
                        ws,
                        { payload: msg.payload, schema: InsuranceMessage },
                        blackjackSendInsuranceSocket
                    )
                    break
                case 'hit':
                    handleMessage(
                        ws,
                        { payload: msg.payload, schema: HitMessage },
                        blackjackSendHitSocket
                    )
                    break
                case 'stand':
                    handleMessage(
                        ws,
                        { payload: msg.payload, schema: StandMessage },
                        blackjackSendStandSocket
                    )
                    break
                case 'split':
                    handleMessage(
                        ws,
                        { payload: msg.payload, schema: SplitMessage },
                        blackjackSendSplitSocket
                    )
                    break
                case 'double':
                    handleMessage(
                        ws,
                        { payload: msg.payload, schema: DoubleMessage },
                        blackjackSendDoubleSocket
                    )
                    break
            }
        } catch (error) {
            ws.send(
                JSON.stringify({
                    type: 'error',
                    payload: { message: 'Invalid message format' },
                })
            )
        }
    },
    close(ws: ServerWebSocket<WebSocketData>) {
        const identifier = `${ws.remoteAddress}`
        socketRemoveConnectionLimit('blackjack', identifier)
    },
}
