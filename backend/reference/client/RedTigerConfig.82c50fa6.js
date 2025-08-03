(window.webpackJsonp = window.webpackJsonp || []).push([
    [122, 85],
    {
        712(a, t, s) {
            'use strict'
            const e = s(1)
            const r = e(s(3))
            const l = e(s(4))
            const i = e(s(8))
            const o = e(s(78))
            const u = e(s(7))
            const n = e(s(9))

            function h(a, t, s) {
                return t = (0, u.default)(t), (0, i.default)(a, (function () {
                    try {
                        var a = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], () => {}))
                    } catch (a) {}
                    return (function () {
                        return !!a
                    }())
                }())
                    ? Reflect.construct(t, s || [], (0, u.default)(a).constructor)
                    : t.apply(a, s))
            }
            const c = s(713)
            const f = s(238)
            const p = (function (a) {
                function t() {
                    return (0, r.default)(this, t), h(this, t, arguments)
                }
                return (0, n.default)(t, a), (0, l.default)(t, [{
                    key: '_parseServer',
                    value() {
                        (0, o.default)((0, u.default)(t.prototype), '_parseServer', this).call(this)
                        const a = {
                            playMode: this._urlParams.playMode === 'real' ? 'real' : 'demo',
                            sessionId: this._urlParams.token || '',
                            userData: {
                                lang: this._urlParams.lang || '',
                                affiliate: this._urlParams.affiliate || '',
                                channel: this._urlParams.channel || ''
                            },
                            custom: {
                                siteId: this._urlParams.casino || '',
                                extras: this._urlParams.extras || ''
                            }
                        }
                        this._cfg.server.launchParams = f(this._cfg.server.launchParams, a)
                    }
                }, {
                    key: '_parseBridge',
                    value() {
                        (0, o.default)((0, u.default)(t.prototype), '_parseBridge', this).call(this), this._cfg.bridge.redirects = {
                            realityCheckHistory: !0,
                            realityCheckExit: !0,
                            lobby: !0,
                            deposit: !0
                        }
                    }
                }, {
                    key: '_parseBars',
                    value() {
                        (0, o.default)((0, u.default)(t.prototype), '_parseBars', this).call(this)
                        const a = this._urlParams.playMode === 'real'
                        const s = {
                            freeBets: this._urlParams.hasFreeBets !== 'false',
                            history: this._isTrue('hasHistory', this._urlParams),
                            roundId: this._isTrue('hasRoundId', this._urlParams),
                            fullScreen: this._urlParams.fullScreen !== 'false',
                            depositButton: Boolean(this._urlParams.depositURL),
                            delegateMessages: !1,
                            lobby: Boolean(this._urlParams.lobbyUrl),
                            lobbyURL: this._urlParams.lobbyUrl ? decodeURIComponent(this._urlParams.lobbyUrl) : '',
                            depositURL: this._urlParams.depositURL || '',
                            hasAutoplayRestart: !0,
                            hasTurboMode: this._urlParams.hasTurboMode !== 'false',
                            autoPlayFields: {
                                totalSpins: !a || this._isTrue('hasAutoplayTotalSpins', this._urlParams),
                                limitLoss: !a || this._isTrue('hasAutoplayLimitLoss', this._urlParams),
                                singleWinLimit: !a || this._isTrue('hasAutoplaySingleWinLimit', this._urlParams),
                                stopOnJackpot: !a || this._isTrue('hasAutoplayStopOnJackpot', this._urlParams),
                                stopOnBonus: !a || this._isTrue('hasAutoplayStopOnBonus', this._urlParams)
                            }
                        }
                        this._cfg.bars.options = f(this._cfg.bars.options, s)
                    }
                }])
            }(c))
            a.exports = p
        },
        790(a, t, s) {
            'use strict'
            const e = s(1)
            const r = e(s(3))
            const l = e(s(4))
            const i = e(s(8))
            const o = e(s(78))
            const u = e(s(7))
            const n = e(s(9))

            function h(a, t, s) {
                return t = (0, u.default)(t), (0, i.default)(a, (function () {
                    try {
                        var a = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], () => {}))
                    } catch (a) {}
                    return (function () {
                        return !!a
                    }())
                }())
                    ? Reflect.construct(t, s || [], (0, u.default)(a).constructor)
                    : t.apply(a, s))
            }
            const c = s(712)
            const f = s(238)
            const p = (function (a) {
                function t() {
                    return (0, r.default)(this, t), h(this, t, arguments)
                }
                return (0, n.default)(t, a), (0, l.default)(t, [{
                    key: '_parseBars',
                    value() {
                        (0, o.default)((0, u.default)(t.prototype), '_parseBars', this).call(this)
                        const a = {
                            freeBets: !1,
                            history: this._urlParams.playMode === 'real',
                            roundId: !1,
                            fullScreen: !0,
                            lobby: !1,
                            delegateMessages: !1,
                            hasTurboMode: !0
                        }
                        this._urlParams.hasPreloader === 'true' && (a.hasPreloader = !0), this._urlParams.hasPreloader === 'false' && (a.hasPreloader = !1), this._cfg.bars.options = f(this._cfg.bars.options, a)
                    }
                }, {
                    key: '_parseGame',
                    value() {
                        (0, o.default)((0, u.default)(t.prototype), '_parseGame', this).call(this), !1 !== this._cfg.game.preconfig.splash && (this._cfg.game.preconfig.splash = this._urlParams.splash !== 'false')
                    }
                }])
            }(c))
            a.exports = p
        }
    }
])