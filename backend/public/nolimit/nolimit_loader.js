(function () {
    console.log('[LOADER] Initializing game...')

    // This is the most reliable way to patch the WebSocket.
    // We replace the entire WebSocket object on the window before the game can use it.
    const OriginalWebSocket = window.WebSocket
    window.WebSocket = function (url, protocols) {
        // This is our modified game.js trying to connect to the proxy.
        // We add the auth token and let it proceed.
        if (url.includes('/ws/proxy')) {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1]
            if (token) {
                const authenticatedUrl = `${url}?token=${token}`
                console.log('[LOADER] Authenticating WebSocket proxy connection.')
                return new OriginalWebSocket(authenticatedUrl, protocols)
            } else {
                console.error('[LOADER] No access_token cookie found. WebSocket connection will likely fail.')
            }
        }
        // This is the original game trying to connect directly. We block it.
        // This should not happen if our game.js modification is working, but it's a good safeguard.
        else {
            console.error(`[LOADER] Blocking direct WebSocket connection attempt to: ${url}`)
            // Return a mock WebSocket object that does nothing, to prevent errors.
            return {
                send: () => {},
                close: () => {},
                addEventListener: () => {},
                removeEventListener: () => {}
            }
        }

        return new OriginalWebSocket(url, protocols)
    }


    // Get parameters from the URL
    const params = new URLSearchParams(window.location.search)
    const gameId = params.get('game')
    const operator = params.get('operator')
    const device = params.get('device')

    if (!gameId || !operator) {
        console.error('[LOADER] Missing \'game\' or \'operator\' URL parameters. Cannot load game.')
        return
    }

    // We need to tell the nolimit loader where to find our modified game.js.
    // We do this by overriding the 'staticRoot' property.
    // const staticRoot = `https://slots.cashflowcasino.com/nolimit/${gameId}`;
    const staticRoot = `https://slots.cashflowcasino.com/nolimit/`
    console.log(`[LOADER] Overriding staticRoot to: ${staticRoot}`)

    // Initialize the nolimit API
    window.nolimit.init({
        operator,
        device: device || 'desktop',
        serverHost: `https://dev.cashflowcasino.com`, // All API calls go to our server
        staticRoot // All game files are loaded from our server
    })

    // Load the game
    window.nolimit.load({
        target: document.getElementById('game-container'),
        game: gameId
    })
})()
