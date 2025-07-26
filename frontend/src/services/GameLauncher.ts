/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/GameLauncher.ts

// --- Type Definitions ---
/*
window.addEventListener('load', () => {
  window.parent.postMessage({ type: 'clientReady' }, '*'); // Use a specific origin in production
});
*/
/**
 * Defines the structure for the launch options object.
 */
interface LaunchOptions {
    launch_url?: string
    target_element?: string
    launch_options?: {
        game_launcher_url?: string
        [key: string]: string | number | boolean | undefined
    }
    [key: string]: unknown
}

/**
 * Defines the options that can be passed to the GameLauncher constructor.
 */
interface GameLauncherConstructorOptions {
    onMessage?: (data: Record<string, unknown>) => void
    [key: string]: unknown
}

/**
 * @class GameLauncher
 * @description Manages the creation, loading, and communication for a game iframe.
 */
class GameLauncher {
    // --- Public and Private Properties ---
    public iframe: HTMLIFrameElement | null = null
    public targetContainer: HTMLElement

    private iframeAttributes: Record<string, string> = {
        frameBorder: '0',
        allow: 'fullscreen;  autoplay',
        scroll: 'false',
        height: '100%',
        width: '100%',
        style: 'border: none; z-index: 9991',
    }

    private targetOrigin: string = ''
    private onMessageCallback:
        | ((data: Record<string, unknown>) => void)
        | undefined
    private messageListener: ((event: MessageEvent) => void) | null = null
    private loadingIndicator: HTMLElement | null = null
    private launchOptions: LaunchOptions | null = null // Store launch options

    /**
     * Creates an instance of GameLauncher.
     * @param target The DOM element or its ID where the iframe will be injected.
     * @param options Configuration options including message callbacks and custom iframe attributes.
     */
    constructor(
        target: HTMLElement | string,
        options: GameLauncherConstructorOptions = {}
    ) {
        const { onMessage, ...customIframeAttributes } = options
        this.iframeAttributes = {
            ...this.iframeAttributes,
            ...(customIframeAttributes as Record<string, string>),
        }
        this.onMessageCallback = onMessage

        if (typeof target === 'string') {
            const element = document.getElementById(target)
            if (!element) {
                throw new Error(
                    `GameLauncher error: Could not find target container with ID "${target}".`
                )
            }
            this.targetContainer = element
        } else {
            this.targetContainer = target
        }
    }

    // --- Loading Indicator Methods ---

    /**
     * Injects the CSS for the loading spinner into the document's head.
     * @private
     */
    private injectLoaderStyles(): void {
        const styleId = 'game-launcher-loader-styles'
        if (document.getElementById(styleId)) return

        const style = document.createElement('style')
        style.id = styleId
        style.innerHTML = `
      .gl-loader-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        z-index: 9992;
      }
      .gl-loader-spinner {
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: gl-spin 1s linear infinite;
      }
      @keyframes gl-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
        document.head.appendChild(style)
    }

    /**
     * Displays the loading indicator over the target container.
     * @private
     */
    private showLoadingIndicator(): void {
        this.injectLoaderStyles()
        if (this.loadingIndicator) return

        this.loadingIndicator = document.createElement('div')
        this.loadingIndicator.className = 'gl-loader-container'
        this.loadingIndicator.innerHTML = `<div class="gl-loader-spinner"></div>`

        // Ensure the target container can host an absolutely positioned element
        if (getComputedStyle(this.targetContainer).position === 'static') {
            this.targetContainer.style.position = 'relative'
        }

        this.targetContainer.appendChild(this.loadingIndicator)
    }

    /**
     * Hides and removes the loading indicator.
     * @private
     */
    private hideLoadingIndicator(): void {
        if (this.loadingIndicator) {
            this.loadingIndicator.remove()
            this.loadingIndicator = null
        }
    }

    // --- Core Methods ---

    private createIframe(): HTMLIFrameElement {
        const iframe = document.createElement('iframe')
        for (const [key, value] of Object.entries(this.iframeAttributes)) {
            iframe.setAttribute(key, value)
        }
        return iframe
    }

    private buildUrl(options: LaunchOptions): URL {
        const gameLauncherUrl = options.launch_options?.game_launcher_url
        const launchUrl = options.launch_url

        if (!gameLauncherUrl && !launchUrl) {
            throw new Error(
                'GameLauncher error: game_launcher_url or launch_url must be set.'
            )
        }
        if (gameLauncherUrl && launchUrl) {
            throw new Error(
                'GameLauncher error: Both game_launcher_url and launch_url are set. Only one is allowed.'
            )
        }

        const urlString = gameLauncherUrl || launchUrl!
        const url = new URL(urlString, window.location.origin)
        this.targetOrigin = url.origin

        if (gameLauncherUrl) {
            const encodedOptions = btoa(
                unescape(encodeURIComponent(JSON.stringify(options)))
            )
            url.searchParams.append('options', encodedOptions)
        }
        return url
    }

    public sendMessage(message: Record<string, unknown>): void {
        if (this.iframe?.contentWindow) {
            // FIX: Convert the message to a plain object to remove Vue proxies,
            // which cannot be cloned for postMessage.
            const plainMessage = JSON.parse(JSON.stringify(message))
            this.iframe.contentWindow.postMessage(
                plainMessage,
                this.targetOrigin || '*'
            )
        } else {
            console.warn('GameLauncher: Iframe not available to send message.')
        }
    }

    private setupMessageListener(): void {
        this.messageListener = (event: MessageEvent) => {
            // Basic security checks
            if (event.source !== this.iframe?.contentWindow) {
                return
            }

            // When the loader is ready, send it the game config
            if (event.data === 'RTG_LOADER_READY') {
                this.hideLoadingIndicator()
                if (this.launchOptions && this.launchOptions.launch_options) {
                    this.sendMessage({
                        type: 'INIT_GAME',
                        config: this.launchOptions.launch_options,
                    })
                } else {
                    console.error(
                        'GameLauncher Error: Received ready signal, but no gameConfig is available.'
                    )
                }
            }

            // Forward all messages to the main callback
            this.onMessageCallback?.(event.data)
        }
        window.addEventListener('message', this.messageListener)
    }

    public destroy(): void {
        this.hideLoadingIndicator() // Ensure loader is removed on destroy
        if (this.messageListener) {
            window.removeEventListener('message', this.messageListener)
            this.messageListener = null
        }
        if (this.targetContainer) {
            this.targetContainer.innerHTML = ''
        }
        console.log('GameLauncher instance destroyed.')
    }

    public run(
        launchOptions: LaunchOptions | string,
        onSuccess?: () => void,
        onError: (error: Error) => void = (error) => {
            throw error
        }
    ): void {
        try {
            this.showLoadingIndicator() // Show loader at the start of the launch process

            let options: LaunchOptions
            if (typeof launchOptions === 'string') {
                options = JSON.parse(launchOptions)
            } else {
                options = launchOptions
            }

            this.launchOptions = options // Store the options

            if (!options.launch_url && !options.launch_options) {
                options = { launch_options: options as any }
            }

            const url = this.buildUrl(
                (options.launch_options as LaunchOptions) || options
            )

            if (!this.iframe) {
                this.iframe = this.createIframe()
            }
            this.iframe.src = url.toString()

            if (!this.targetContainer.contains(this.iframe)) {
                this.targetContainer.innerHTML = '' // Clear container before adding
                this.targetContainer.appendChild(this.iframe)
                this.targetContainer.appendChild(this.loadingIndicator!) // Re-append loader on top
            }

            this.setupMessageListener()
            onSuccess?.()
        } catch (error) {
            this.hideLoadingIndicator() // Hide loader on error
            onError(error as Error)
        }
    }

    public launch = this.run
}

export default GameLauncher
