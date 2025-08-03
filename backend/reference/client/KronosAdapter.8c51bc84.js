(window.webpackJsonp = window.webpackJsonp || []).push([
    [84],
    {
        721(e, t, s) {
            'use strict'
            const a = s(1)
            const i = a(s(6))
            const n = a(s(3))
            const o = a(s(4))
            const h = a(s(8))
            const r = a(s(78))
            const c = a(s(7))
            const P = a(s(9))

            function A(e, t) {
                const s = Object.keys(e)
                if (Object.getOwnPropertySymbols) {
                    let a = Object.getOwnPropertySymbols(e)
                    t && (a = a.filter((t) => {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable
                    })), s.push.apply(s, a)
                }
                return s
            }

            function u(e) {
                for (let t = 1; t < arguments.length; t++) {
                    var s = arguments[t] != null ? arguments[t] : {}
                    t % 2
                        ? A(new Object(s), !0).forEach((t) => {
                                (0, i.default)(e, t, s[t])
                            })
                        : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(s))
                            : A(new Object(s)).forEach((t) => {
                                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(s, t))
                                })
                }
                return e
            }

            function l(e, t, s) {
                return t = (0, c.default)(t), (0, h.default)(e, (function () {
                    try {
                        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], () => {}))
                    } catch (e) {}
                    return (function () {
                        return !!e
                    }())
                }())
                    ? Reflect.construct(t, s || [], (0, c.default)(e).constructor)
                    : t.apply(e, s))
            }
            const _ = (function (e) {
                function t() {
                    return (0, n.default)(this, t), l(this, t, arguments)
                }
                return (0, P.default)(t, e), (0, o.default)(t, [{
                    key: 'subscribe',
                    value(e, s, a) {
                        (0, r.default)((0, c.default)(t.prototype), 'subscribe', this).call(this, e, s, a), this.GameAPI.on(this.GameAPI.events.LOAD_GAME_PROGRESS, this._onGameEvent, this), this.GameAPI.on(this.GameAPI.events.LOAD_GAME_COMPLETE, this._onGameEvent, this), this.GameAPI.on(this.GameAPI.events.GAME_READY, this._onGameEvent, this), this.GameAPI.on(this.GameAPI.events.GAME_STARTED, this._onGameEvent, this), this.GameAPI.on(this.GameAPI.events.WINBAR_CHANGE, this._onGameEvent, this), this.GameAPI.on(this.GameAPI.events.AUTOPLAY_START, this._onGameEvent, this), this.GameAPI.on(this.GameAPI.events.AUTOPLAY_STOP, this._onGameEvent, this), this.GameAPI.on(this.GameAPI.events.PROPERTY_CHANGED, this._onGameProperty, this), this.GameAPI.on(this.GameAPI.events.STATE_CHANGED, this._onGameState, this), this.BarsAPI.on(s.events.MESSAGE_SHOW, this._onBarsEvent.bind(this)), this.BarsAPI.on(s.events.POPUP_SHOW, this._onBarsEvent.bind(this)), this.BarsAPI.on(s.events.MESSAGE_HIDDEN, this._onBarsEvent.bind(this)), this.BarsAPI.on(s.events.POPUP_HIDDEN, this._onBarsEvent.bind(this))
                    }
                }, {
                    key: 'handleBalanceChange',
                    value(e) {
                        (0, r.default)((0, c.default)(t.prototype), 'handleBalanceChange', this).call(this, e), this._postMessage('balanceChange', {
                            balance: e.cash.toFixed(2),
                            free_balance: e.freeBets.toFixed(2)
                        })
                    }
                }, {
                    key: '_handleRealityCheckContinue',
                    value() {
                        this._postMessage('realityCheckContinue')
                    }
                }, {
                    key: '_handleRealityCheckHistory',
                    value(e) {
                        this._postMessage('realityCheckHistory'), this.config.redirects && !1 === this.config.redirects.realityCheckHistory || Object.assign(document.createElement('a'), {
                            target: '_blank',
                            href: e.url
                        }).click()
                    }
                }, {
                    key: '_handleRealityCheckExit',
                    value(e) {
                        this._postMessage('realityCheckExit'), this.config.redirects && !1 === this.config.redirects.realityCheckExit || (window.top.location = e.url)
                    }
                }, {
                    key: '_onPostMessage',
                    value(e) {
                        (0, r.default)((0, c.default)(t.prototype), '_onPostMessage', this).call(this, e)
                        const s = e.data.type
                        const a = e.data.payload
                        switch (s) {
                            case 'startGame':
                                document.dispatchEvent(new KeyboardEvent('keydown', {
                                    keyCode: 32,
                                    which: 32
                                }))
                                break
                            case 'action':
                                this.GameAPI.action(a.action, a.history)
                                break
                            case 'showHelp':
                                this.BarsAPI.showHelp()
                                break
                            case 'showPaytable':
                                this.GameAPI.paytableShow()
                                break
                            case 'soundUnmute':
                                this.GameAPI.soundUnmute()
                                break
                            case 'soundMute':
                                this.GameAPI.soundMute()
                                break
                            case 'updateResize':
                                a && a.size && this.GameAPI.updateResize(u(u({}, a.size), {}, {
                                    overlay: {
                                        bottom: 0,
                                        top: 0,
                                        left: 0,
                                        right: 0
                                    }
                                }))
                                break
                            case 'autoPlayStop':
                                this.inAutoPlay && this.GameAPI.autoPlayStop('manual')
                        }
                    }
                }, {
                    key: '_onGameProperty',
                    value(e) {
                        switch (e.prop) {
                            case this.GameAPI.statuses.MUTE:
                                e.value ? this._postMessage('soundMute') : this._postMessage('soundUnmute')
                                break
                            case this.GameAPI.statuses.GAME_ENABLED:
                                e.value ? this._postMessage('gameEnabled') : this._postMessage('gameDisabled')
                        }
                    }
                }, {
                    key: '_onGameState',
                    value(e) {
                        switch (e.state) {
                            case this.GameAPI.states.SPIN_START:
                            case this.GameAPI.states.PLAY_START:
                                this._postMessage('playStart')
                                break
                            case this.GameAPI.states.SPIN_END:
                            case this.GameAPI.states.PLAY_END:
                                this._postMessage('playEnd')
                        }
                    }
                }, {
                    key: '_onGameEvent',
                    value(e) {
                        switch (e.type) {
                            case this.GameAPI.events.LOAD_GAME_COMPLETE:
                                this._postMessage('loadGameComplete')
                                break
                            case this.GameAPI.events.LOAD_GAME_PROGRESS:
                                this._postMessage('loadGameProgress', {
                                    progress: e.progress
                                })
                                break
                            case this.GameAPI.events.GAME_READY:
                                this._postMessage('gameReady')
                                break
                            case this.GameAPI.events.GAME_STARTED:
                                this._postMessage('gameStarted')
                                break
                            case this.GameAPI.events.WINBAR_CHANGE:
                                this._postMessage('winbarChange', {
                                    amount: e.value.toFixed(2)
                                })
                                break
                            case this.GameAPI.events.AUTOPLAY_START:
                                this._postMessage('autoPlayStart')
                                break
                            case this.GameAPI.events.AUTOPLAY_STOP:
                                this._postMessage('autoPlayStop')
                                break
                            case this.GameAPI.events.PLAY_START:
                            case this.GameAPI.events.SPIN_START:
                                this._postMessage('playStart')
                                break
                            case this.GameAPI.events.PLAY_END:
                            case this.GameAPI.events.SPIN_END:
                                this._postMessage('playEnd')
                        }
                    }
                }, {
                    key: '_onBarsEvent',
                    value(e) {
                        switch (e.type) {
                            case this.BarsAPI.events.MESSAGE_SHOW:
                            case this.BarsAPI.events.POPUP_SHOW:
                                this._postMessage('messageShow')
                                break
                            case this.BarsAPI.events.MESSAGE_HIDDEN:
                            case this.BarsAPI.events.POPUP_HIDDEN:
                                this._postMessage('messageHide')
                        }
                    }
                }])
            }(s(335)))
            e.exports = _
        }
    }
])