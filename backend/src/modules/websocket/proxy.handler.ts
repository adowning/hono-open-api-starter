import type { Buffer } from 'node:buffer'
import chalk from 'chalk'

// LZW decompression function
function lzw_decode(s: string): string {
    if (!s) return ''
    const dict: { [key: number]: string } = {}
    const data = s.split('')
    let currChar = data[0]
    let oldPhrase = currChar
    const out = [currChar]
    let code = 256
    let phrase
    for (let i = 1; i < data.length; i++) {
        const currCode = data[i].charCodeAt(0)
        if (currCode < 256) {
            phrase = data[i]
        } else {
            phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar
        }
        out.push(phrase)
        currChar = phrase.charAt(0)
        dict[code] = oldPhrase + currChar
        code++
        oldPhrase = phrase
    }
    return out.join('')
}

export const proxyHandler = {
    open(ws: any) {
        console.log(chalk.green('[PROXY-WS] Client connected.'))
        ws.data.upstreamSocket = null

        try {
            const url = new URL(ws.data.url)
            const upstreamUrl = url.searchParams.get('upstream')

            if (!upstreamUrl) {
                console.error(
                    chalk.red('[PROXY-WS] Fatal: No upstream URL provided in query parameters.')
                )
                ws.close(1011, 'No upstream URL provided.')
                return
            }

            console.log(
                chalk.cyan(`[PROXY-WS] Connecting to upstream: ${upstreamUrl}`)
            )

            const upstreamSocket = new WebSocket(upstreamUrl)

            ws.data.upstreamSocket = upstreamSocket

            upstreamSocket.onopen = () => {
                console.log(
                    chalk.green(
                        '[PROXY-WS] Upstream connection established. Proxy is ready.'
                    )
                )
            }

            upstreamSocket.onmessage = (event) => {
                const decodedMessage = event.data.toString()
                if (decodedMessage.startsWith('lzw:')) {
                    const decompressed = lzw_decode(
                        decodedMessage.substring(4)
                    )
                    console.log(
                        chalk.magenta('[PROXY-WS] S -> C (DECODED):'),
                        decompressed
                    )
                    ws.send(decompressed)
                } else {
                    console.log(
                        chalk.magenta('[PROXY-WS] S -> C (RAW):'),
                        decodedMessage
                    )
                    ws.send(decodedMessage)
                }
            }

            upstreamSocket.onclose = () => {
                console.log(
                    chalk.yellow('[PROXY-WS] Upstream connection closed.')
                )
                ws.close()
            }

            upstreamSocket.onerror = (error) => {
                console.error(
                    chalk.red('[PROXY-WS] Upstream connection error:'),
                    error
                )
                ws.close()
            }
        } catch (e) {
            console.error(chalk.red('[PROXY-WS] Error in open handler:'), e)
            ws.close()
        }
    },

    message(ws: any, msg: Buffer) {
        if (ws.data.upstreamSocket && ws.data.upstreamSocket.readyState === WebSocket.OPEN) {
            const messageString = msg.toString()
            console.log(chalk.blue('[PROXY-WS] C -> S:'), messageString)
            ws.data.upstreamSocket.send(messageString)
        } else {
            console.log(chalk.yellow('[PROXY-WS] Received message, but upstream socket is not ready.'))
        }
    },

    close(ws: any) {
        console.log(chalk.yellow('[PROXY-WS] Client disconnected.'))
        if (ws.data.upstreamSocket) {
            ws.data.upstreamSocket.close()
        }
    },

    error(ws: any, error: Error) {
        console.error(chalk.red('[PROXY-WS] Client connection error:'), error)
        if (ws.data.upstreamSocket) {
            ws.data.upstreamSocket.close()
        }
    },
}
