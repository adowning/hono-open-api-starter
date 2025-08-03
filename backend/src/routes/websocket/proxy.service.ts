import chalk from 'chalk'

// The real Nolimit server URL for the initial handshake
const UPSTREAM_URL = 'https://demo.nolimitcity.com/EjsFrontWeb/fs'

export const GameProxyService = {
    async forwardRequest(body: any): Promise<any> {
        console.log(
            chalk.blue('[PROXY-HTTP] Forwarding request to:'),
            UPSTREAM_URL
        )
        console.log(chalk.blue('[PROXY-HTTP] Body:'), JSON.stringify(body, null, 2))

        try {
            // We use a plain urlencoded form for this request
            const formData = new URLSearchParams()
            for (const key in body) {
                formData.append(key, body[key])
            }

            const response = await fetch(UPSTREAM_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json',
                },
                body: formData,
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error(
                    chalk.red(
                        `[PROXY-HTTP] Upstream request failed with status ${response.status}:`
                    ),
                    errorText
                )
                throw new Error(
                    `Upstream server responded with status ${response.status}`
                )
            }

            const data = await response.json()
            console.log(
                chalk.green('[PROXY-HTTP] Received response from upstream:'),
                data
            )
            return data
        } catch (error) {
            console.error(
                chalk.red('[PROXY-HTTP] Error forwarding request:'),
                error
            )
            throw new Error('Failed to forward request to upstream server.')
        }
    },
}
