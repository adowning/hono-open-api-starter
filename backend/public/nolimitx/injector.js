(function() {
    console.log("[INJECTOR V8] Script loaded. Intercepting data requests...");

    const topParams = new URLSearchParams(window.top.location.search);
    const gameName = topParams.get('game');

    // 1. WebSocket Patch
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        let modifiedUrl = url;
        if (url.includes('/ws/proxy')) {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            if (token) {
                modifiedUrl = `${url}?token=${token}`;
            }
        }
        return new OriginalWebSocket(modifiedUrl, protocols);
    };

    // 2. XMLHttpRequest Patch
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        return originalXhrOpen.apply(this, arguments);
    };

    const originalXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        console.log('sending')
        if (this._url && this._url.endsWith('info.json')) {
            const originalOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    try {
                        const info = JSON.parse(this.responseText);
                        info.staticRoot = `https://slots.cashflowcasino.com/nolimit/${info.name}`;
                        Object.defineProperty(this, 'responseText', { value: JSON.stringify(info), writable: true });
                    } catch (e) {
                        console.error('[INJECTOR] Failed to modify info.json response.', e);
                    }
                }
                if (originalOnReadyStateChange) {
                    originalOnReadyStateChange.apply(this, arguments);
                }
            };
        }
        return originalXhrSend.apply(this, arguments);
    };

    // 3. Load the original game loader script
    const script = document.createElement('script');
    script.src = './nolimit-latest.min.js';
    script.crossOrigin = "anonymous";
    script.onerror = () => console.error("[INJECTOR] Failed to load the original game loader.");
    script.onload = () => {
        // 4. Wait for the nolimit object to be ready, then trigger the game.
        const interval = setInterval(() => {
            if (window.nolimit && window.nolimit.load) {
                clearInterval(interval);
                console.log("[INJECTOR] Nolimit object is ready. Triggering game load...");
                
                const operator = topParams.get('operator');
                const device = topParams.get('device');

                if (!gameName || !operator) {
                    console.error("[INJECTOR] Missing 'game' or 'operator' URL parameters.");
                    return;
                }

                const gameContainer = document.createElement('div');
                gameContainer.id = 'game-container';
                document.body.appendChild(gameContainer);
                console.log(window.nolimit.info)

                window.nolimit.init({
                    operator: operator,
                    device: device || 'desktop',
                    serverHost: `http://localhost:9999/`
                });
                window.nolimit.load({
                    target: gameContainer,
                    game: gameName
                });
            }
        }, 50); // Check every 50ms
    };
    document.head.appendChild(script);

})();