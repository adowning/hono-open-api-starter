(function () {
    console.log('[LOADER V11] Initializing...')

    // --- WebSocket Patch ---
    const OriginalWebSocket = window.WebSocket
    window.WebSocket = function (url, protocols) {
        let modifiedUrl = url

        // This is the key: We intercept the connection to the REAL game server.
        if (url.includes('nolimitcity.com')) {
            console.log(`[LOADER] Intercepting original WebSocket connection to: ${url}`)

            const proxyUrl = `wss://dev.cashflowcasino.com/ws/proxy`
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1]

            if (token) {
                // We change the URL to our proxy and pass the original URL as a parameter.
                modifiedUrl = `${proxyUrl}?token=${token}&upstream=${encodeURIComponent(url)}`
                console.log(`[LOADER] Redirecting to proxy: ${modifiedUrl}`)
            } else {
                console.error('[LOADER] No access_token cookie found. Cannot connect to proxy.')
                // To prevent the game from crashing, we return a mock socket that does nothing.
                return {
                    send: () => {},
                    close: () => {},
                    addEventListener: () => {},
                    removeEventListener: () => {}
                }
            }
        }

        return new OriginalWebSocket(modifiedUrl, protocols)
    }
    console.log('[LOADER] WebSocket patch is active.')

    // --- Game Loader ---
    const waitForNolimit = setInterval(() => {
        if (window.nolimit && window.nolimit.load) {
            clearInterval(waitForNolimit)
            console.log('[LOADER] Nolimit object is ready. Launching game...')

            const params = new URLSearchParams(window.location.search)
            const gameId = params.get('game')
            const operator = params.get('operator')
            const device = params.get('device')

            if (!gameId || !operator) {
                console.error('[LOADER] Missing \'game\' or \'operator\' URL parameters.')
                return
            }

            // We do not need to modify staticRoot or serverHost.
            // The WebSocket patch is sufficient and more reliable.
            window.nolimit.init({
                operator,
                device: device || 'desktop'
            })

            window.nolimit.load({
                target: document.getElementById('game-container'),
                game: gameId
            })
        }
    }, 50)
})()