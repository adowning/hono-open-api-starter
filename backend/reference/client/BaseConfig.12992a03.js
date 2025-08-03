(window.webpackJsonp = window.webpackJsonp || []).push([
    [0],
    {
        713(e, t, a) {
            'use strict'
            let n; const s = a(1)
            const r = s(a(25))
            const i = s(a(3))
            const o = s(a(4))
            const c = s(a(6))
            const u = s(a(870))
            const l = s(a(871))
            const p = s(a(872))
            const g = s(a(867))
            const d = s(a(876))
            const f = s(a(880))

            function h(e, t) {
                const a = Object.keys(e)
                if (Object.getOwnPropertySymbols) {
                    let n = Object.getOwnPropertySymbols(e)
                    t && (n = n.filter((t) => {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable
                    })), a.push.apply(a, n)
                }
                return a
            }

            function m(e) {
                for (let t = 1; t < arguments.length; t++) {
                    var a = arguments[t] != null ? arguments[t] : {}
                    t % 2
                        ? h(new Object(a), !0).forEach((t) => {
                                (0, c.default)(e, t, a[t])
                            })
                        : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
                            : h(new Object(a)).forEach((t) => {
                                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
                                })
                }
                return e
            }
            const b = a(60).getURLParams()
            const _ = a(881)
            const y = a(882)
            const v = a(883)
            const T = a(884)
            const k = a(885)
            const P = a(886)
            const O = a(887)
            const R = a(888)
            const I = a(889)
            const A = a(890)
            const S = a(891)
            const E = a(893)
            const w = (function () {
                function e(t, a, n) {
                    const s = this
                    const o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
                    (0, i.default)(this, e), this._cfg = this._preParse(n), this._operator = a, this._provider = t, this._settings = null, this._abTest = o.abTest, this._urlParams = b, this.name = o.name, this._cfg.bridge && this._cfg.bridge.postParams && (0, r.default)(this._cfg.bridge.postParams) === 'object' && Object.keys(this._cfg.bridge.postParams).forEach((e) => {
                        s._urlParams[e] = s._cfg.bridge.postParams[e]
                    })
                }
                return (0, o.default)(e, [{
                    key: 'parse',
                    value() {
                        this._isRTG = this._cfg.game.namespace === 'com.casino.game', this._isCayetano = this._cfg.game.namespace === 'com.cayetano.game', this._isNSG = this._cfg.game.namespace === 'com.nsg.game', this._isNetent = this._cfg.game.namespace === 'com.netent.game', this._isDemo = this._cfg.server.launchParams && this._cfg.server.launchParams.playMode === 'demo', this._isSlot = this._cfg.game.preconfig.gameType === 'slot', this._isTap = this._cfg.game.preconfig.gameType === 'tap', this._isTouch = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), this._isIOS10 = document.querySelector('html').classList.contains('ios10'), this._brand = this._cfg.server.launchParams.custom && this._cfg.server.launchParams.custom.siteId, this._parse()
                    }
                }, {
                    key: 'get',
                    value(e) {
                        return this._cfg[e] || console.warn('[bridge] #BaseConfig: You are trying to access undefined prop '.concat(e, '?!?!?!')), this._cfg[e]
                    }
                }, {
                    key: 'setSettings',
                    value(e) {
                        this._settings = e, this._parse()
                    }
                }, {
                    key: 'parseLaunch',
                    value(e) {
                        const t = e.launcherConfig
                        t.debug && (com.casino.debug = {
                            enabled: !0
                        }), this._cfg = {
                            bundle: t.bundle,
                            bridge: y.parseLaunch(t),
                            server: S.parseLaunch(t),
                            game: v.parseLaunch(t),
                            bars: _.parseLaunch(t),
                            analytics: A.parseLaunch(t)
                        }, t && t.bundle && (this._cfg = I.parseLaunch(t, this._cfg), t.params && (this._urlParams = m(m({}, this._urlParams), t.params)))
                    }
                }, {
                    key: 'parseSkinConfig',
                    value(e) {
                        const t = e.source
                        const a = e.skin
                        const n = e.originGameId
                        a && (this._cfg.game.preconfig = m(m({}, this._cfg.game.preconfig), {}, {
                            cdn: this._cfg.game.preconfig.cdn.replace(n, t),
                            skin: a,
                            gameAppId: t,
                            mappedSkin: Boolean(a)
                        }), this._cfg.bars.basePath = this._cfg.bars.basePath.replace(n, t))
                    }
                }, {
                    key: '_preParse',
                    value() {
                        const e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
                        return e
                    }
                }, {
                    key: '_parse',
                    value() {
                        this._parseAnalytics(), this._parseRedirects(), this._parseErrors(), this._parseBridge(), this._parseServer(), this._brand = this._cfg.server.launchParams.custom && this._cfg.server.launchParams.custom.siteId, this._isDemo = this._cfg.server.launchParams && this._cfg.server.launchParams.playMode === 'demo', this._parseBars(), this._parseGame(), this._parseGamble(), this._parseWidgets(), this._parseJackpot(), this._parseTournament(), this._parseBonus(), this._parseRegulations(), this._cfg.bundle && this._parseBundle(), this.isRTG || this._override()
                    }
                }, {
                    key: '_parseAnalytics',
                    value() {
                        this._cfg.analytics = A.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseRedirects',
                    value() {
                        this._cfg.redirects = {
                            realityCheckHistory: !1,
                            realityCheckExit: !1,
                            lobby: !1,
                            deposit: !1
                        }
                    }
                }, {
                    key: '_parseErrors',
                    value() {
                        this._cfg.errors = E.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseBridge',
                    value() {
                        this._cfg.bridge = y.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseServer',
                    value() {
                        this._cfg.server = S.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseBars',
                    value() {
                        this._cfg.bars = _.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseGame',
                    value() {
                        this._cfg.game = v.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseGamble',
                    value() {
                        this._cfg.gamble = T.parse(this._cfg, this._settings, this.options), window.com.casino.piePath = this._cfg.gamble && this._cfg.gamble.basePath
                    }
                }, {
                    key: '_parseWidgets',
                    value() {
                        this._cfg.widgets = P.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseJackpot',
                    value() {
                        this._cfg.jackpotPanel = O.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseTournament',
                    value() {
                        this._cfg.tournament = R.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_parseBonus',
                    value() {
                        this._cfg.bonus = k.parse(this._cfg, this._settings, this.options), this._cfg.bonusWheel = k.parseWheel(this._cfg, this._settings, this.options), window.com.casino.bonusPath = this._cfg.bonus && this._cfg.bonus.basePath
                    }
                }, {
                    key: '_parseRegulations',
                    value() {
                        if (this._settings && this._settings.user.country) {
                            const t = this._settings.user.country.toUpperCase()
                            this.userSpinDuration = this._settings.user.limits && this._settings.user.limits.spinDuration, this.userSpinDuration && this._setRegulations([{
                                name: e.regulationTypes.MIN_ROUND_DURATION,
                                options: {
                                    duration: this.userSpinDuration,
                                    hasSpinProgress: !1
                                }
                            }])
                            const a = (0, d.default)('customLang', this._operator, this._brand)
                            const n = a.customLanguage
                            const s = a.target
                            n && s
                                ? this._setRegulations([{
                                        name: e.regulationTypes.CUSTOM_LANGUAGE,
                                        options: {
                                            lang: n
                                        }
                                    }])
                                : this._setRegulations(p.default.create(t))
                        }
                        f.default.includes(this._brand) && this._setRegulations(e.brRegulation), this._provider !== 'evolution' && e.deRegulation.push({
                            name: e.regulationTypes.REGULATION_RTP
                        })
                        const r = (0, d.default)('defaultStakeBrands')
                        r != null && r.includes(this._brand) && (this._setRegulations(e.nlRegulation), console.log('Netherlands Regulations are activated for brand: '.concat(this._brand)))
                    }
                }, {
                    key: '_parseBundle',
                    value() {
                        this._cfg = I.parse(this._cfg, this._settings, this.options)
                    }
                }, {
                    key: '_override',
                    value() {
                        switch (this._cfg.game.namespace) {
                            case 'com.cayetano.game':
                                this._cfg.bars.skin = 'cayetano', this._cfg.bars.options.totalStake = this.isTable, this._cfg.bars.options.paid = this.isTable, this._cfg.bars.options.hasTurboMode = !1, this._settings && (this._cfg.gamble = {
                                    enabled: this._settings.game.hasGambleGame
                                }, this._cfg.bonus = m(m({}, this._cfg.bonus), {}, {
                                    hasGamble: this._settings.game.hasGambleGame
                                }))
                                break
                            case 'com.nsg.game':
                                this._cfg.bonus.enabled = !1
                        }
                    }
                }, {
                    key: '_isTrue',
                    value(e, t) {
                        return t[e] === 'true' || t[e] === '1'
                    }
                }, {
                    key: '_setRegulations',
                    value() {
                        const e = this
                        const t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : []
                        t.length && (this._cfg.bars.options.hasRegulations = !0, t.forEach((t) => {
                            return e._setRegulation(t)
                        }))
                    }
                }, {
                    key: '_setRegulation',
                    value(t) {
                        switch (t.name) {
                            case e.regulationTypes.PAYTABLE_SHOW_PAYOUTS:
                                this._cfg.game.preconfig.paytableShowPayouts = !0
                                break
                            case e.regulationTypes.REGULATION_RTP:
                                this._cfg.bars.options.hasRegulationRtp = !0
                                break
                            case e.regulationTypes.HELP_TABLE_CONTROLS:
                                this._cfg.bars.options.helpTableControls = !0
                                break
                            case e.regulationTypes.MAX_WIN_PROBABILITY:
                                this._provider !== 'evolution' && (this._cfg.bars.options.maxWinProbability = !0)
                                break
                            case e.regulationTypes.DRAG:
                                this._isSlot && (this._cfg.game.preconfig.dragEnabled = !1)
                                break
                            case e.regulationTypes.VERSION:
                                this._cfg.bars.options.hasVersions = !0
                                break
                            case e.regulationTypes.HELP:
                                this._cfg.bars.options.hasHelp = !0
                                break
                            case e.regulationTypes.TURBO:
                                this._cfg.bars.options.hasTurboMode = !1
                                break
                            case e.regulationTypes.MIN_ROUND_DURATION:
                                var a = t.options.duration
                                var n = void 0 !== t.options.hasSpinProgress ? t.options.hasSpinProgress : this._isSlot || this._isTap
                                this.userSpinDuration && this.userSpinDuration > t.options.duration && (a = this.userSpinDuration), this._cfg.bars.options.minRoundDuration = a, this._cfg.bridge.minRoundDuration = a, this._cfg.game.preconfig.minRoundDuration = a, this._cfg.bridge.hasSpinProgress = n, this._cfg.bars.options.hasSpinProgress = n
                                break
                            case e.regulationTypes.RESTRICT_ROUND_CELEBRATIONS:
                                this._cfg.bridge.restrictRoundCelebrations = !0
                                break
                            case e.regulationTypes.SKIP_ANIMATION:
                                this._cfg.bridge.hasAnimationSkip = !1, this._cfg.bars.options.hasAnimationSkip = !1
                                break
                            case e.regulationTypes.TURBO_SPIN:
                                this._cfg.bars.hasTurboSpin = !1
                                break
                            case e.regulationTypes.WIN_RATES:
                                this._cfg.bars.options.hasWinRates = !0
                                break
                            case e.regulationTypes.WHEEL_WIN_ONLY:
                                this._cfg.jackpotWheel && (this._cfg.jackpotWheel.wheelWinOnly = !0)
                                break
                            case e.regulationTypes.MAX_MULTIPLIER_TEXT:
                                this._cfg.bars.hasMaxMultiplierText = !1
                                break
                            case e.regulationTypes.PAYOUT_EXAMPLE_TEXT_NO_MULTILINE:
                                this._cfg.bars.options.hasPayoutExampleTextNoMultiline = !0
                                break
                            case e.regulationTypes.GAME_SESSION:
                                this._urlParams.toggleGameSession !== 'false' && (this._cfg.bars.options.hasGameSession = !0)
                                break
                            case e.regulationTypes.STOP_AUTOPLAY:
                                this._cfg.bars.options.hasAutoplay = !1
                                break
                            case e.regulationTypes.HAS_STOP:
                                this._cfg.bars.options.hasStop = !1
                                break
                            case e.regulationTypes.HIDE_TURBO_TOOLTIP:
                                this._cfg.bars.options.hasTurboTooltip = !1
                                break
                            case e.regulationTypes.HELP_MAX_MULTIPLIER:
                                this._cfg.bars.hasHelpMaxMultiplier = !1
                                break
                            case e.regulationTypes.FEATURE_BUY_COMFIRMATION:
                                this._cfg.bars.options.hasFeatureBuyConfirmation = !0
                                break
                            case e.regulationTypes.FORCE_RESOLUTION:
                                this._cfg.game.preconfig.forceResolution = 'SD'
                                break
                            case e.regulationTypes.HELP_ADDITIONAL_EXPLANATION:
                                this._cfg.bars.options.hasAdditionalExplanation = !0
                                break
                            case e.regulationTypes.PAYTABLE_DYNAMIC_PAYOUTS:
                                this._cfg.game.preconfig.paytableDynamicPayouts = !0, this._cfg.bars.options.paytableDynamicPayouts = !0
                                break
                            case e.regulationTypes.MIN_ROUND_DURATION_STRICT:
                                this._cfg.game.preconfig.minRoundDurationStrict = !0
                                break
                            case e.regulationTypes.MAX_MULTIPLIER_WIN_LINES:
                                this._cfg.bars.options.hasMaxMultiplierWinLines = !0
                                break
                            case e.regulationTypes.CUSTOM_LANGUAGE:
                                this._cfg.game.preconfig.customLang = t.options.lang, this._cfg.bars.options.customLang = {
                                    enabled: !0,
                                    lang: t.options.lang
                                }
                                break
                            case e.regulationTypes.FEATURE_BUY_VERSION:
                                this._cfg.bars.options.hasFeatureBuyVersion = !0
                                break
                            case e.regulationTypes.VOLATILITY_INDEX:
                                this._cfg.bars.options.hasVolatilityIndex = !0
                                break
                            case e.regulationTypes.DOUBLE_REBET_PROMPT:
                                this._cfg.game.preconfig.doubleRebetPrompt = !0
                                break
                            case e.regulationTypes.DEFAULT_STAKE:
                                this._cfg.bars.useDefaultStake = !0
                                break
                            default:
                                console.warn('this type of regulation is not handled yet!')
                        }
                    }
                }, {
                    key: '_setTournament',
                    value(e) {
                        let t = e.skin
                        if (!this._isSlot) return console.warn('[bridge] #BaseConfig: You\'re trying to enable tournament while not in slot game!!!')
                        if (this._isDemo) return console.warn('[bridge] #BaseConfig: You\'re trying to enable tournament in demo mode!!!')
                        if (!t) return console.warn('[bridge] #BaseConfig: You\'re trying to set a tournament config without skin!!!')
                        if (this._isNetent || this._isNSG) return console.warn('[bridge] #BaseConfig: You\'re trying to set a tournament on netent or nsg!!!')
                        this._cfg.widgets.enabled = !0, t === 'tournaments-generic' && (t = l.default.genericSkinMapping())
                        let a = ''.concat(this._cfg.game.preconfig.cdn, '../../widgets/').concat(t, '/')
                        if (b.inReview === 'true' || this._cfg.bridge.inReview) {
                            const n = b.tournamentBranch || 'dev'
                            a = ''.concat(this._cfg.game.preconfig.cdn, '../../../../../widgets/').concat(t, '/').concat(n, '/dist/')
                        }
                        this._cfg.widgets.tournaments = {
                            enabled: !0,
                            base: a,
                            assets: 'assets/',
                            main: 'app.min.js',
                            leaderboardUrl: ''.concat(this._cfg.bridge.feedUrl, '/tournaments/leaderboard/'),
                            timestamp: this._cfg.bridge.timestamp
                        }
                    }
                }, {
                    key: '_setJackpot',
                    value(e) {
                        let t = e.skin
                        const a = e.hasWheel
                        let n = void 0 === a || a
                        const s = e.wheelWinOnly
                        const r = this._cfg.bridge.timestamp
                        const i = this._cfg.jackpotPanel && this._cfg.jackpotPanel.skipJackpotMapping
                        if (t !== 'network' || i || (t = u.default.networkSkinMapping()), this._cfg.jackpotPanel = {
                            enabled: !1,
                            basePath: ''.concat(this._cfg.game.preconfig.cdn, '../../widgets/jackpots/base-jackpot/'),
                            main: 'app.js',
                            styles: 'app.css',
                            timestamp: r,
                            skin: 'base-jackpot',
                            version: 'jackpotNext',
                            hasShuffleAnimation: !1,
                            hasWinAnimation: !1,
                            feedUrl: ''.concat(this._cfg.bridge.feedUrl, '/'),
                            assets: 'assets/',
                            skipJackpotMapping: i
                        }, !this._isSlot) { return console.warn('[bridge] #BaseConfig: You\'re trying to enable jackpot while not in slot game!!!')
                        }
                        n = n && !this._isCayetano
                        const o = b.inReview === 'true' || this._cfg.bridge.inReview
                        if (!t) return console.warn('[bridge] #BaseConfig: You\'re trying to set a jackpot config without skin!!!')
                        if (this._cfg.game.preconfig.skipJackpotWin = n, this._settings && this._settings.jackpots && this._settings.jackpots.jackpotId) {
                            this._cfg.widgets.enabled = !0
                            const c = n ? 'WHEEL' : 'GAME'
                            const l = n && !s ? t : 'base-wheel'
                            let p = ''.concat(this._cfg.game.preconfig.cdn, '../../widgets/jackpots/').concat(t, '/')
                            let g = 'games/scenes/jackpot-wheels/'.concat(l, '/')
                            if (o) {
                                const d = b.jackpotBranch || 'dev'
                                const f = b.jackpotWheelBranch || 'dev'
                                const h = b.jackpotPack
                                p = ''.concat(this._cfg.game.preconfig.cdn, '../../../../../widgets/jackpots/').concat(h ? ''.concat(h, '/') : '').concat(t, '/').concat(d, '/dist/'), g = '../../../games/scenes/jackpot-wheels/'.concat(l, '/').concat(f, '/dist/')
                            }
                            this._cfg.jackpotPanel = {
                                enabled: !0,
                                basePath: p,
                                main: 'app.js',
                                styles: 'app.css',
                                timestamp: r,
                                skin: t,
                                skinVersion: this._settings.jackpots.version,
                                version: 'jackpotNext',
                                hasShuffleAnimation: !n,
                                hasWinAnimation: !n,
                                feedUrl: ''.concat(this._cfg.bridge.feedUrl, '/'),
                                assets: 'assets/',
                                winType: c,
                                skipJackpotMapping: i
                            }, this._cfg.jackpotWheel = {
                                enabled: n,
                                basePath: g,
                                cdn: ''.concat(this._cfg.game.preconfig.cdn, '../../../'),
                                skin: t,
                                wheelWinOnly: s,
                                timestamp: r
                            }
                        }
                    }
                }, {
                    key: 'getHelp',
                    value(e) {
                        let t; let a; let n; const s = this._settings || {}
                        let r = {}
                        const i = e.help
                        const o = this._cfg.bridge
                        const c = this._cfg.bars
                        const u = this._cfg.gamble && !0 === this._cfg.gamble.enabled
                        const l = this._cfg.game.preconfig.gameType === 'slot'
                        const p = !(this._cfg.game.namespace === 'com.cayetano.game')
                        const g = e.helpURL
                        const d = e.rtp
                        const f = e.isStateful
                        const h = !1 !== c.options.hasRtp && d !== 0
                        const b = s.game && s.game.gameType
                        const _ = s.game && (b === 'slot' || b === 'scratch') && !1 !== c.hasMaxMultiplierText && s.game.maxMultiplier
                        const y = s.game && s.game.pendingRoundDays
                        const v = c.options.hasVersions
                        const T = c.options.hasFeatureBuyVersion
                        const k = c.options.hasGameSession
                        const P = c.help && c.help.jackpots && !0 === c.help.jackpots.hasDynamicTimeJackpot
                        const O = c.help && c.help.jackpots && c.help.jackpots.dynamicTimeJackpotValue
                        const R = s.jackpots && !0 === s.jackpots.dynamicAllocation
                        const I = R && s.jackpots.stakeCaps
                        const A = c.options.hasPayoutExampleTextNoMultiline || !1
                        const S = this._cfg.game.namespace === 'com.casino.game' && (this._cfg.game.preconfig.gameType === 'blackjack' || this._cfg.game.preconfig.gameType === 'roulette')
                        const E = c.options.hasFeatureBuy
                        const w = c.options.hasAdditionalExplanation
                        const N = c.options.hasVolatilityIndex && s.game && s.game.volatilityIndex
                        c.options.hasWinRates && (t = s.game && s.game.maxWinlineHitRate && !isNaN(s.game.maxWinlineHitRate) ? s.game.maxWinlineHitRate : null, a = s.game && s.game.maxMultiplierHitRate && !isNaN(s.game.maxMultiplierHitRate) ? s.game.maxMultiplierHitRate : null, n = h)
                        const U = s.user && s.user.stakes && s.user.stakes.types
                        if (s.jackpots && s.jackpots.pots && s.jackpots.pots.length) {
                            const L = function (e, t) {
                                return Boolean(e.find((e) => {
                                    return e.type === t
                                }))
                            }
                            r = {
                                pots: s.jackpots.pots.map((e) => {
                                    return {
                                        name: e.name,
                                        id: e.id,
                                        seedAmount: e.seedAmount,
                                        seedNextAmount: e.seedNextAmount,
                                        type: e.type
                                    }
                                }),
                                hasTimeJackpot: L(s.jackpots.pots, 'time'),
                                hasFixedJackpot: L(s.jackpots.pots, 'fixed'),
                                hasCeilingJackpot: L(s.jackpots.pots, 'ceiling'),
                                hasProgressiveJackpot: L(s.jackpots.pots, 'progressive'),
                                hasDynamicTimeJackpot: R || P,
                                dynamicTimeJackpotValue: I || O,
                                wheelWinOnly: this._cfg.jackpotWheel && this._cfg.jackpotWheel.wheelWinOnly
                            }
                        }
                        const j = i && void 0 !== i.hasAutoplaySettings ? e.hasAutoplaySettings : !c.options.autoPlayFields || c.options.autoPlayFields && c.options.autoPlayFields.singleWinLimit || c.options.autoPlayFields && c.options.autoPlayFields.stopOnJackpot || c.options.autoPlayFields && c.options.autoPlayFields.stopOnBonus
                        const C = {
                            hasAutoplay: i && void 0 !== i.hasAutoplay ? i.hasAutoplay : !1 !== e.hasAutoplay,
                            hasStake: i && void 0 !== i.hasStake ? i.hasStake : !1 !== e.hasStake,
                            hasGamble: i && void 0 !== i.hasGamble && !0 === u ? i.hasGamble : u,
                            gambleType: this._cfg.gamble && this._cfg.gamble.type,
                            hasTurboSpin: i && void 0 !== i.hasTurboSpin ? i.hasTurboSpin : !1 !== e.hasTurboSpin,
                            hasJackpotPanel: i && void 0 !== i.hasJackpotPanel ? i.hasJackpotPanel : this._cfg.bars.options.hasJackpotPanel,
                            hasInternalJackpot: i && void 0 !== i.hasInternalJackpot ? i.hasInternalJackpot : !0 === e.hasInternalJackpot,
                            hasFreeSpins: i && void 0 !== i.hasFreeSpins ? i.hasFreeSpins : !0 === e.hasFreeSpins,
                            hasGameSession: i && void 0 !== i.hasGameSession ? i.hasGameSession : !0 === this._cfg.bars.options.hasGameSession
                        };
                        (!1 === o.hasAnimationSkip || !1 === c.hasTurboSpin || o.minRoundDuration > 0) && (C.hasTurboSpin = !1)
                        const M = ['CA']
                        const D = this.settings && this.settings.user && typeof this.settings.user.country == 'string' && this.settings.user.country.split('-')[0]
                        const B = {
                            game: s.game && s.game.version,
                            launcher: M.includes(D) ? null : s.launcher && s.launcher.version || s.platform && s.platform.version,
                            manufacturer: M.includes(D),
                            featureBuy: s.game && s.game.featureBuyVersion
                        }
                        const x = c.options.helpTableControls
                        return m(m({}, C), {}, {
                            hasAutoplaySettings: j,
                            jackpots: r,
                            hasSlotText: l,
                            hasGenericText: p,
                            helpURL: g,
                            rtp: d,
                            hasRtp: h,
                            maxMultiplier: _,
                            gameType: b,
                            pendingRoundDays: y,
                            versions: B,
                            hasVersions: v,
                            hasFeatureBuyVersion: T,
                            isStateful: f,
                            maxWinlineHitRate: t,
                            maxMultiplierHitRate: a,
                            avgPayoutRate: n,
                            hasPayoutExampleTextNoMultiline: A,
                            hasGameSession: k,
                            hasFeatureBuy: E,
                            rtpTable: S,
                            stakeSteps: U,
                            hasAdditionalExplanation: w,
                            volatilityIndex: N,
                            helpTableControls: x
                        })
                    }
                }, {
                    key: 'getPreloaderOptions',
                    value() {
                        const e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
                        const t = {
                            client: e.client,
                            powered: e.powered,
                            studio: e.studio,
                            publisher: e.publisher,
                            collaborator: e.collaborator,
                            license: e.license
                        }
                        const a = {
                            background: e.background || '#000000'
                        }
                        return {
                            values: t,
                            styles: a
                        }
                    }
                }, {
                    key: '_getEvoPreloaderOptions',
                    value() {
                        const e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
                        return e.values.client === 'netent' && (e.values.collaborator = 'netent'), e.values.powered !== 'fashiontv' && (e.values.powered = null), e.values.client = 'red-tiger', e.additionalOptions = {
                            bottomText: 'Powered by Evolution'
                        }, e
                    }
                }, {
                    key: 'options',
                    get() {
                        return {
                            namespace: this._cfg.game.namespace,
                            isDemo: this.isDemo,
                            isSlot: this.isSlot,
                            isTap: this.isTap,
                            isTable: this.isTable,
                            isRTG: this.isRTG,
                            isCayetano: this.isCayetano,
                            isNetent: this.isNetent,
                            isNsg: this.isNsg,
                            isIOS10: this._isIOS10,
                            urlParams: this._urlParams,
                            abTest: this._abTest,
                            isDevEnvironment: this.isDevEnvironment
                        }
                    }
                }, {
                    key: 'settings',
                    get() {
                        return this._settings
                    }
                }, {
                    key: 'isDemo',
                    get() {
                        return this._isDemo
                    }
                }, {
                    key: 'isRTG',
                    get() {
                        return this._isRTG
                    }
                }, {
                    key: 'isCayetano',
                    get() {
                        return this._isCayetano
                    }
                }, {
                    key: 'isNsg',
                    get() {
                        return this._isNSG
                    }
                }, {
                    key: 'isNetent',
                    get() {
                        return this._isNetent
                    }
                }, {
                    key: 'isSlot',
                    get() {
                        return this._isSlot
                    }
                }, {
                    key: 'isTap',
                    get() {
                        return this._isTap
                    }
                }, {
                    key: 'isBlackJack',
                    get() {
                        return this._cfg.game.preconfig.gameType === 'blackjack'
                    }
                }, {
                    key: 'isRoulette',
                    get() {
                        return this._cfg.game.preconfig.gameType === 'roulette'
                    }
                }, {
                    key: 'isBaccarat',
                    get() {
                        return this._cfg.game.preconfig.gameType === 'baccarat'
                    }
                }, {
                    key: 'isTable',
                    get() {
                        return this._cfg.game.preconfig.gameType === 'blackjack' || this._cfg.game.preconfig.gameType === 'roulette' || this._cfg.game.preconfig.gameType === 'threecardbrag' || this._cfg.game.preconfig.gameType === 'baccarat'
                    }
                }, {
                    key: 'isScratch',
                    get() {
                        return this._cfg.game.preconfig.gameType === 'scratch'
                    }
                }, {
                    key: 'isDevEnvironment',
                    get() {
                        return com.casino && void 0 !== com.casino.debug
                    }
                }, {
                    key: 'raw',
                    get() {
                        return this._cfg
                    }
                }])
            }())
            n = w, (0, c.default)(w, 'regulationTypes', g.default), (0, c.default)(w, 'deRegulation', [{
                name: n.regulationTypes.TURBO
            }, {
                name: n.regulationTypes.TURBO_SPIN
            }, {
                name: n.regulationTypes.WIN_RATES
            }, {
                name: n.regulationTypes.MIN_ROUND_DURATION,
                options: {
                    duration: 5
                }
            }, {
                name: n.regulationTypes.MIN_ROUND_DURATION_STRICT
            }, {
                name: n.regulationTypes.MAX_WIN_PROBABILITY
            }, {
                name: n.regulationTypes.PAYTABLE_DYNAMIC_PAYOUTS
            }, {
                name: n.regulationTypes.MAX_MULTIPLIER_WIN_LINES
            }, {
                name: n.regulationTypes.SKIP_ANIMATION
            }]), (0, c.default)(w, 'brRegulation', [{
                name: n.regulationTypes.REGULATION_RTP
            }, {
                name: n.regulationTypes.PAYTABLE_SHOW_PAYOUTS
            }, {
                name: n.regulationTypes.HELP_TABLE_CONTROLS
            }]), (0, c.default)(w, 'nlRegulation', [{
                name: n.regulationTypes.DEFAULT_STAKE
            }, {
                name: n.regulationTypes.DRAG
            }]), e.exports = w
        },
        867(e, t, a) {
            'use strict'
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            t.default = {
                DRAG: 'drag',
                VERSION: 'version',
                HELP: 'help',
                TURBO: 'turbo',
                MIN_ROUND_DURATION: 'min_round_duration',
                RESTRICT_ROUND_CELEBRATIONS: 'restrict_round_celebrations',
                MIN_ROUND_DURATION_STRICT: 'min_round_duration_strict',
                SKIP_ANIMATION: 'skip_animation',
                TURBO_SPIN: 'turbo_spin',
                WIN_RATES: 'win_rates',
                WHEEL_WIN_ONLY: 'wheel_win_only',
                MAX_MULTIPLIER_TEXT: 'max_multiplier_text',
                MAX_MULTIPLIER_WIN_LINES: 'max_multiplier_win_lines',
                PAYOUT_EXAMPLE_TEXT_NO_MULTILINE: 'payout_example_text_no_multiline',
                GAME_SESSION: 'game_session',
                STOP_AUTOPLAY: 'stop_autoplay',
                HAS_STOP: 'has_stop',
                HIDE_TURBO_TOOLTIP: 'hide_turbo_tooltip',
                HELP_MAX_MULTIPLIER: 'help_max_multiplier',
                FEATURE_BUY_COMFIRMATION: 'feature_buy_confirmation',
                FORCE_RESOLUTION: 'force_resolution',
                HELP_ADDITIONAL_EXPLANATION: 'help_additional_explanation',
                PAYTABLE_DYNAMIC_PAYOUTS: 'paytable_dynamic_payouts',
                MAX_WIN_PROBABILITY: 'max_win_probability',
                CUSTOM_LANGUAGE: 'custom_language',
                FEATURE_BUY_VERSION: 'feature_buy_version',
                VOLATILITY_INDEX: 'volatility_index',
                DOUBLE_REBET_PROMPT: 'double_rebet_prompt',
                DEFAULT_STAKE: 'default_stake',
                REGULATION_RTP: 'regulation_rtp',
                PAYTABLE_SHOW_PAYOUTS: 'PAYTABLE_SHOW_PAYOUTS',
                HELP_TABLE_CONTROLS: 'help_table_controls'
            }
        },
        868(e, t, a) {
            'use strict'
            const n = a(1)
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            const s = n(a(867))
            t.default = [{
                countryCode: ['CH'],
                regulations: [{
                    name: s.default.VERSION
                }, {
                    name: s.default.FEATURE_BUY_VERSION
                }, {
                    name: s.default.MAX_MULTIPLIER_TEXT
                }]
            }, {
                countryCode: ['US'],
                regulations: [{
                    name: s.default.DRAG
                }, {
                    name: s.default.MAX_MULTIPLIER_TEXT
                }, {
                    name: s.default.PAYOUT_EXAMPLE_TEXT_NO_MULTILINE
                }]
            }, {
                countryCode: ['SE'],
                regulations: [{
                    name: s.default.HELP
                }, {
                    name: s.default.TURBO
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }]
            }, {
                countryCode: ['DK'],
                regulations: [{
                    name: s.default.HELP
                }, {
                    name: s.default.TURBO
                }, {
                    name: s.default.VERSION
                }, {
                    name: s.default.FEATURE_BUY_VERSION
                }, {
                    name: s.default.TURBO_SPIN
                }, {
                    name: s.default.SKIP_ANIMATION
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }, {
                    name: s.default.MIN_ROUND_DURATION_STRICT
                }]
            }, {
                countryCode: ['GR'],
                regulations: [{
                    name: s.default.HELP
                }, {
                    name: s.default.TURBO
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 2
                    }
                }, {
                    name: s.default.MAX_MULTIPLIER_TEXT
                }]
            }, {
                countryCode: ['ES'],
                regulations: [{
                    name: s.default.HELP
                }, {
                    name: s.default.TURBO
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }, {
                    name: s.default.WHEEL_WIN_ONLY
                }, {
                    name: s.default.VERSION
                }]
            }, {
                countryCode: ['UK', 'GB'],
                regulations: [{
                    name: s.default.TURBO
                }, {
                    name: s.default.TURBO_SPIN
                }, {
                    name: s.default.SKIP_ANIMATION
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 2.5
                    }
                }, {
                    name: s.default.STOP_AUTOPLAY
                }]
            }, {
                countryCode: ['CA'],
                regulations: [{
                    name: s.default.DRAG
                }, {
                    name: s.default.MAX_MULTIPLIER_TEXT
                }, {
                    name: s.default.VERSION
                }]
            }, {
                countryCode: ['NL'],
                regulations: [{
                    name: s.default.TURBO_SPIN
                }]
            }, {
                countryCode: ['CO'],
                regulations: [{
                    name: s.default.TURBO
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }, {
                    name: s.default.MAX_MULTIPLIER_TEXT
                }]
            }, {
                countryCode: ['LT'],
                regulations: [{
                    name: s.default.TURBO
                }, {
                    name: s.default.TURBO_SPIN
                }, {
                    name: s.default.SKIP_ANIMATION
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 1
                    }
                }, {
                    name: s.default.STOP_AUTOPLAY
                }]
            }, {
                countryCode: ['PT'],
                regulations: [{
                    name: s.default.TURBO
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }, {
                    name: s.default.WHEEL_WIN_ONLY
                }]
            }, {
                countryCode: ['CZ'],
                regulations: [{
                    name: s.default.TURBO
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 2
                    }
                }, {
                    name: s.default.HELP_MAX_MULTIPLIER
                }]
            }, {
                countryCode: ['BS', 'PA', 'PE', 'AR', 'BR'],
                regulations: [{
                    name: s.default.MAX_MULTIPLIER_TEXT
                }]
            }]
        },
        870(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = a(0)
            const o = (function () {
                return (0, r.default)(function e() {
                    (0, s.default)(this, e)
                }, null, [{
                    key: 'networkSkinMapping',
                    value() {
                        const e = new Date()
                        const t = `2020-${String(e.getMonth() + 1).padStart(2, '0')}-${String(e.getDate()).padStart(2, '0')}`
                        return i(t).isBetween('2020-02-03', '2020-02-16', [], []) ? 'networkValentine' : i(t).isBetween('2020-03-10', '2020-03-21', [], []) ? 'networkStPatrick' : i(t).isBetween('2020-03-29', '2020-04-20', [], []) ? 'networkEaster' : i(t).isBetween('2020-06-01', '2020-08-31', [], []) ? 'networkSummer' : i(t).isBetween('2020-10-17', '2020-10-31', [], []) ? 'networkHalloween' : i(t).isBetween('2020-12-01', '2020-12-31', [], []) || i(t).isBetween('2020-01-01', '2020-01-08', [], []) ? 'networkChristmas' : 'network'
                    }
                }])
            }())
            e.exports = o
        },
        871(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = a(0)
            const o = (function () {
                return (0, r.default)(function e() {
                    (0, s.default)(this, e)
                }, null, [{
                    key: 'genericSkinMapping',
                    value() {
                        const e = new Date()
                        const t = `2020-${String(e.getMonth() + 1).padStart(2, '0')}-${String(e.getDate()).padStart(2, '0')}`
                        return i(t).isBetween('2020-12-01', '2020-12-31', [], []) || i(t).isBetween('2020-01-01', '2020-01-08', [], []) ? 'tournaments-christmas' : 'tournaments-generic'
                    }
                }])
            }())
            e.exports = o
        },
        872(e, t, a) {
            'use strict'
            const n = a(1)
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            const s = n(a(53))
            const r = n(a(54))
            const i = n(a(3))
            const o = n(a(4))
            const c = n(a(873))
            const u = n(a(875))
            const l = (function () {
                return (0, o.default)(function e() {
                    (0, i.default)(this, e)
                }, null, [{
                    key: 'create',
                    value(e) {
                        const t = typeof e == 'string' ? (0, s.default)(e.split('-')) : ['', '']
                        const a = (0, r.default)(t, 2)
                        const n = a[0]
                        const i = a[1]
                        return i ? (0, c.default)(n, i) : (0, u.default)(n)
                    }
                }])
            }())
            t.default = l
        },
        873(e, t, a) {
            'use strict'
            const n = a(1)
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            const s = n(a(53))
            const r = n(a(868))
            const i = n(a(874))
            t.default = function (e, t) {
                const a = i.default.find((a) => {
                    return a.regionCode === t && a.countryCode === e
                })
                const n = r.default.find((t) => {
                    return t.countryCode.includes(e)
                })
                const o = a ? a.regulations : []
                const c = n ? n.regulations : []
                return [].concat((0, s.default)(c), (0, s.default)(o))
            }
        },
        874(e, t, a) {
            'use strict'
            const n = a(1)
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            const s = n(a(867))
            t.default = [{
                countryCode: 'US',
                regionCode: 'NJ',
                regulations: [{
                    name: s.default.DOUBLE_REBET_PROMPT
                }]
            }, {
                countryCode: 'CA',
                regionCode: 'LQ',
                regulations: [{
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }, {
                    name: s.default.VERSION
                }, {
                    name: s.default.TURBO
                }]
            }, {
                countryCode: 'CA',
                regionCode: 'ON',
                regulations: [{
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 2.5
                    }
                }, {
                    name: s.default.TURBO
                }, {
                    name: s.default.TURBO_SPIN
                }, {
                    name: s.default.SKIP_ANIMATION
                }, {
                    name: s.default.RESTRICT_ROUND_CELEBRATIONS
                }]
            }, {
                countryCode: 'CA',
                regionCode: 'BC',
                regulations: [{
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }, {
                    name: s.default.TURBO
                }]
            }, {
                countryCode: 'AR',
                regionCode: 'C',
                regulations: [{
                    name: s.default.VOLATILITY_INDEX
                }, {
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }, {
                    name: s.default.TURBO
                }]
            }, {
                countryCode: 'AR',
                regionCode: 'X',
                regulations: [{
                    name: s.default.VOLATILITY_INDEX
                }]
            }, {
                countryCode: 'AR',
                regionCode: 'M',
                regulations: [{
                    name: s.default.MIN_ROUND_DURATION,
                    options: {
                        duration: 3
                    }
                }, {
                    name: s.default.TURBO
                }]
            }, {
                countryCode: 'US',
                regionCode: 'CT',
                regulations: [{
                    name: s.default.CUSTOM_LANGUAGE,
                    options: {
                        lang: 'en-CT'
                    }
                }]
            }]
        },
        875(e, t, a) {
            'use strict'
            const n = a(1)
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            const s = n(a(53))
            const r = n(a(868))
            t.default = function (e) {
                const t = r.default.find((t) => {
                    return t.countryCode.includes(e)
                })
                const a = t ? t.regulations : []
                return (0, s.default)(a)
            }
        },
        876(e, t, a) {
            'use strict'
            const n = a(1)
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            const s = n(a(877))
            const r = n(a(879))
            t.default = function (e, t, a) {
                switch (e) {
                    case 'customLang':
                        return (0, s.default)(t, a)
                    case 'defaultStakeBrands':
                        return r.default
                }
            }
        },
        877(e, t, a) {
            'use strict'
            const n = a(1)
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            const s = n(a(6))
            const r = n(a(878))

            function i(e, t) {
                const a = Object.keys(e)
                if (Object.getOwnPropertySymbols) {
                    let n = Object.getOwnPropertySymbols(e)
                    t && (n = n.filter((t) => {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable
                    })), a.push.apply(a, n)
                }
                return a
            }

            function o(e) {
                for (let t = 1; t < arguments.length; t++) {
                    var a = arguments[t] != null ? arguments[t] : {}
                    t % 2
                        ? i(new Object(a), !0).forEach((t) => {
                                (0, s.default)(e, t, a[t])
                            })
                        : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
                            : i(new Object(a)).forEach((t) => {
                                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
                                })
                }
                return e
            }
            t.default = function (e, t) {
                if (e) {
                    const a = r.default.find((t) => {
                        return t.operators.hasOwnProperty(e)
                    }) || {}
                    const n = a.config
                    const s = a.operators
                    return n && s
                        ? s[e].includes(t)
                            ? o(o({}, n), {}, {
                                    target: t
                                })
                            : s.hasOwnProperty(e) && s[e].length === 0
                                ? o(o({}, n), {}, {
                                        target: e
                                    })
                                : n
                        : (console.warn('[bridge] #customLangMapping: Provided operator: '.concat(e, ' or brand: ').concat(t || 'unknown', ' doesn`t exists in the custom lang mapping, so the custom lang regulation will not be activated... Activating RegulationsFactory ')), {})
                }
            }
        },
        878(e, t, a) {
            'use strict'
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            t.default = [{
                config: {
                    customLanguage: 'en-CT',
                    target: null
                },
                operators: {
                    'evo-fanduelct0000000': ['fanduelct0000001', 'fanduelctus00002'],
                    'evo-draftkingsct0000': ['draftkingsct0001', 'draftkingscthub1']
                }
            }, {
                config: {
                    customLanguage: 'en-ZA',
                    target: null
                },
                operators: {
                    'evo-10bet00000000000': [],
                    'evo-aardvark00000000': [],
                    'evo-betcoza000000000': [],
                    'evo-betolimpmga00000': [],
                    'evo-ragingrivermga00': [],
                    'evo-ezugi00000000001': ['101', '102', '103', '104', '105', '106', '107', '108', '109'],
                    'evo-gaminghubmga0000': [],
                    'evo-intelligent00000': [],
                    'evo-interbetmga00000': [],
                    'evo-jackpotstar00000': [],
                    'evo-lulabets00000000': [],
                    'evo-palacebet0000000': [],
                    'evo-sunbet0000000000': [],
                    'evo-turfsportmga0000': [],
                    'evo-worldsports00000': [],
                    'evo-yesplay000000000': [],
                    'evo-kingmakersmga000': [],
                    'evo-spinazonke000000': [],
                    'evo-entain0000000000': ['entainza00000001'],
                    'evo-betconstruct0000': ['betconstructza01'],
                    'evo-compliance000000': ['complsouthafrica']
                }
            }]
        },
        879(e, t, a) {
            'use strict'
            Object.defineProperty(t, '__esModule', {
                value: !0
            }), t.default = void 0
            t.default = ['711nl00000000001', '777nl00000000001', 'aventomga0000001-3', 'betcitynl0000001', 'betconstructnl01', 'betnationnl00001', 'betssonnl0000001', 'krooncasinonl001', 'oranjecasinonl01', 'bingoalnl0000001', 'boylesportsnl001', 'circusnl00000001', 'comeonnl00000001', 'entainnl00000001', 'fairplaycasinonl', 'fairplaycasinonl-1', 'ggpokernl0000001', 'hollandcasinonl1', 'hommersonnl00001', 'icasinonl0000001', 'interwettennl001', 'jacksnl000000001', 'betmgmnl00000001', 'leovegasnl000001', 'vibetnl000000001', 'livescorenl00001', 'lnlnl00000000001', 'nlolivecasino001', 'onecasino0000001-4', 'playnorthnl00001', 'kindrednl0000001', 'kindrednl0000001-1', 'mrvegas000000001-5', '888.nl', 'PRIMARY', 'leovegasnl000001-3', 'livescorenloss01', '144', 'vivaro0000000001-2']
        },
        880(e, t, a) {
            'use strict'
            e.exports = ['belloatechbr0001', 'bet365br00000001', 'betfairbr0000001', 'bandbetbr0000001', 'betssonbr0000001', 'ktobetbr00000001', 'leovegasbr000001', 'novibetbr0000001', 'reidopitacobr001', 'stakebr000000001', 'lottolandbr00001', 'sorteonlinebr001', 'a8latam000000001', 'a8latam200000001', 'apostaganhacom01', 'bet7kcom00000001', 'betconstructlat1', 'bingoemcasa00001', 'blazecom00000001', 'brbetesportecom1', 'entainbr00000001', 'esportesdasorte1', 'estrelabet000001', 'ngxnv00000000001', 'stoss00000000001', 'superbetbr000001', 'weebetbr00000001', 'brbetanocom00001']
        },
        881(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = a(384)
            const o = (function () {
                return (0, r.default)(function e() {
                    (0, s.default)(this, e)
                }, null, [{
                    key: 'parseLaunch',
                    value(e) {
                        return {
                            basePath: ''.concat(e.cdn, 'bars-next/'),
                            assetsPath: '',
                            options: {}
                        }
                    }
                }, {
                    key: 'parse',
                    value(e, t, a) {
                        e.bars.namespace = e.game.namespace, e.bars.timestamp = e.bridge.timestamp, e.bars.options.hasTurboMode = Boolean(e.bars.options.hasTurboMode), e.bars.gameType = e.game.preconfig.gameType, e.bars.options.hasExtras = i.hasExtras, e.bars.options.totalStake = a.isTable, a.isRTG && (e.bars.options.hasPreloader = !0), void 0 === e.bars.options.hasSlideUp && (e.bars.options.hasSlideUp = !0), (a.urlParams.inApp || a.urlParams.inapp) && (e.bars.options.inApp = !0), e.bars.options.inApp && (e.bars.options.hasSlideUp = !1, e.bars.options.fullScreen = !1), e.bars.assetsPath || (e.bars.assetsPath = ''.concat(e.game.preconfig.cdn, '../../assets/')), a.urlParams.assetsPath && (e.bars.assetsPath = a.urlParams.assetsPath), e.bars.localizationsPath || (e.bars.localizationsPath = ''.concat(e.game.preconfig.cdn, '../../localizations/')), e.bars.provider = e.bridge.provider
                        let n = {}
                        if (t && t.user && (n = {
                            sessionCode: t.user.aamsSessionId,
                            participationCode: t.user.aamsParticipationId,
                            balanceCash: t.user.balance.cash,
                            balanceSession: t.user.balance.session,
                            maxDeposit: t.user.maxDeposit,
                            depositedAmount: t.user.depositedAmount
                        }, e.bridge.providerParams && !0 === e.bridge.providerParams.hasSessionBalance && (e.bars.isLegacy = !0), void 0 !== t.user.autoplay && (e.bars.options.autoplay = t.user.autoplay), e.gamble && e.gamble.enabled)) {
                            ['kindred', 'skillonnet', 'mrgreen', 'casinobet'].includes(e.bridge.operator) && !a.abTest.generate({
                                chance: 50
                            }) && (console.log('[bridge] - AB tests for gamble activated'), e.bars.options.hasGambleNext = !0)
                        }
                        switch (t && t.game && (e.bars.options.hasFeatureBuy = Boolean(t.game.hasFeatureBuy)), e.bars.session = n, e.game.preconfig.gameAppId) {
                            case 'NFTMegaWays':
                                e.bars.skin = 'nftmegaways'
                        }
                        return e.bars
                    }
                }])
            }())
            e.exports = o
        },
        882(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(6))
            const r = n(a(3))
            const i = n(a(4))

            function o(e, t) {
                const a = Object.keys(e)
                if (Object.getOwnPropertySymbols) {
                    let n = Object.getOwnPropertySymbols(e)
                    t && (n = n.filter((t) => {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable
                    })), a.push.apply(a, n)
                }
                return a
            }
            const c = (function () {
                return (0, i.default)(function e() {
                    (0, r.default)(this, e)
                }, null, [{
                    key: 'parseLaunch',
                    value(e) {
                        return {
                            operator: e.operator,
                            provider: e.provider,
                            timestamp: '?t='.concat(e.cacheBust),
                            feedUrl: e.feed,
                            cdn: e.cdn,
                            gameProvider: e.gameProvider,
                            realityCheck: {}
                        }
                    }
                }, {
                    key: 'parse',
                    value(e, t, a) {
                        const n = e.bridge.realityCheck || {}
                        const r = a.urlParams.lobbyURL || a.urlParams.lobbyUrl || a.urlParams.lobbyurl || a.urlParams.realityCheckLobbyUrl
                        const i = a.urlParams.depositUrl || a.urlParams.depositURL || a.urlParams.depositurl
                        const c = a.urlParams.historyUrl || a.urlParams.historyURL || a.urlParams.historyurl || a.urlParams.realityCheckHistoryUrl
                        return e.bridge.hasSkip = !0, e.bridge.hasAnimationSkip = !0, e.bridge.hasErrorTracking = !(e.bundle || a.urlParams.hasErrorTracking !== 'true' && a.isDevEnvironment), e.bridge.realityCheck = (function (e) {
                            for (let t = 1; t < arguments.length; t++) {
                                var a = arguments[t] != null ? arguments[t] : {}
                                t % 2
                                    ? o(new Object(a), !0).forEach((t) => {
                                            (0, s.default)(e, t, a[t])
                                        })
                                    : Object.getOwnPropertyDescriptors
                                        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
                                        : o(new Object(a)).forEach((t) => {
                                                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
                                            })
                            }
                            return e
                        }({
                            minutes: Number.parseFloat(a.urlParams.realityCheckMinutes) || 0,
                            elapsedMinutes: Number.parseFloat(a.urlParams.realityCheckElapsedMinutes) || 0,
                            lobbyUrl: r,
                            depositUrl: i,
                            historyUrl: c
                        }, n)), e.bridge.userActivity = {
                            enabled: !1,
                            minutes: 20
                        }, e.bridge.userActivity = {
                            enabled: !1,
                            minutes: 20
                        }, e.bridge.localizationsPath || (e.bridge.localizationsPath = ''.concat(e.game.preconfig.cdn, '../../localizations/')), e.bridge
                    }
                }])
            }())
            e.exports = c
        },
        883(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = (function () {
                function e() {
                    (0, s.default)(this, e)
                }
                return (0, r.default)(e, null, [{
                    key: 'parseLaunch',
                    value(t) {
                        const a = e.getGameDirectory({
                            type: t.gameType,
                            provider: t.gameProvider
                        })
                        return {
                            namespace: 'com.'.concat(t.gameProvider, '.game'),
                            preconfig: {
                                cdn: ''.concat(t.cdn).concat(a, '/').concat(t.gameId, '/'),
                                defaultLang: t.defaultLanguage,
                                disclaimer: t.disclaimer,
                                gameType: t.gameType,
                                timestamp: ''.concat(t.cacheBust, '1')
                            }
                        }
                    }
                }, {
                    key: 'parse',
                    value(e, t, a) {
                        const n = e.bridge.timestamp
                        return e.game.preconfig.hasRtp = e.bars.options.hasRtp, e.game.preconfig.increaseSpeedByPercent = 0, e.game.preconfig.skipJackpotWin = !0, e.game.preconfig.timestamp = ''.concat(n.substr(3), '1'), e.bars.options.hasPreloader && (e.game.preconfig.splash = !1, delete e.game.preconfig.disclaimer), a.isSlot && a.isRTG && !e.game.preconfig.mappedSkin && delete e.game.preconfig.skin, e.game.preconfig.localizationsPath || (e.game.preconfig.localizationsPath = ''.concat(e.game.preconfig.cdn, '../../localizations/')), e.game
                    }
                }, {
                    key: 'getGameDirectory',
                    value(e) {
                        const t = e.type
                        const a = e.provider
                        let n = t === 'slot' ? 'slots' : 'table'
                        return a !== 'casino' && (n = 'slots-'.concat(a)), n
                    }
                }])
            }())
            e.exports = i
        },
        884(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = (function () {
                return (0, r.default)(function e() {
                    (0, s.default)(this, e)
                }, null, [{
                    key: 'parse',
                    value(e, t, a) {
                        if (t) {
                            if (a.isRTG && (!e.gamble || !e.gamble.type)) {
                                e.gamble = {
                                    type: 'pie',
                                    enabled: t.game.hasGambleGame,
                                    basePath: ''.concat(e.game.preconfig.cdn, '../../gambles/').concat('pie', '/')
                                }
                            }
                            a.isRTG && !0 === e.gamble.enabled && (e.gamble.enabled = !a.isIOS10)
                        }
                        return e.gamble
                    }
                }])
            }())
            e.exports = i
        },
        885(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(6))
            const r = n(a(3))
            const i = n(a(4))

            function o(e, t) {
                const a = Object.keys(e)
                if (Object.getOwnPropertySymbols) {
                    let n = Object.getOwnPropertySymbols(e)
                    t && (n = n.filter((t) => {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable
                    })), a.push.apply(a, n)
                }
                return a
            }

            function c(e) {
                for (let t = 1; t < arguments.length; t++) {
                    var a = arguments[t] != null ? arguments[t] : {}
                    t % 2
                        ? o(new Object(a), !0).forEach((t) => {
                                (0, s.default)(e, t, a[t])
                            })
                        : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
                            : o(new Object(a)).forEach((t) => {
                                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
                                })
                }
                return e
            }
            const u = (function () {
                return (0, i.default)(function e() {
                    (0, r.default)(this, e)
                }, null, [{
                    key: 'parse',
                    value(e, t, a) {
                        const n = !(a.isDemo || a.isScratch || a.isNsg || a.isTap || a.isRTG && a.isTable || e.bridge.provider === 'evolution')
                        return e.bridge.inReview || (e.bonus = {
                            enabled: n,
                            provider: e.bridge.provider,
                            basePath: ''.concat(e.game.preconfig.cdn, '../../widgets/bonus/'),
                            cdnPath: ''.concat(e.game.preconfig.cdn, '../../../'),
                            assetsPath: ''.concat(e.game.preconfig.cdn, '../../assets/')
                        }, n && (e.widgets.enabled = !0)), e.bonus = c(c({}, e.bonus), {}, {
                            hasTurboMode: e.bars.options.hasTurboMode,
                            hasGamble: e.gamble && e.gamble.enabled,
                            isBlackJack: a.isBlackJack,
                            timestamp: e.bridge.timestamp,
                            gameId: e.server.launchParams.gameId,
                            hasBonusLinks: Boolean(!0 === e.bars.options.hasBonusLinks),
                            hasFeatureBuy: e.bars.options.hasFeatureBuy
                        }), e.bonus
                    }
                }, {
                    key: 'parseWheel',
                    value(e) {
                        return e.bonusWheel || (e.bonusWheel = {
                            cdn: e.game.preconfig.cdn,
                            basePath: '../../scenes/bonus-wheels/bonus-wheel/',
                            skin: 'bonus-wheel',
                            enabled: !0
                        }), e.bonusWheel
                    }
                }])
            }())
            e.exports = u
        },
        886(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = (function () {
                return (0, r.default)(function e() {
                    (0, s.default)(this, e)
                }, null, [{
                    key: 'parse',
                    value(e) {
                        return e.widgets || (e.widgets = {
                            enabled: !1,
                            enablePanel: !1,
                            panel: {
                                base: ''.concat(e.game.preconfig.cdn, '../../widgets/panel/'),
                                main: 'app.min.js'
                            },
                            tournaments: {
                                base: ''.concat(e.game.preconfig.cdn, '../../widgets/tournaments/'),
                                assets: 'assets/',
                                main: 'app.min.js',
                                leaderboardUrl: ''.concat(e.bridge.feedUrl, '/tournaments/leaderboard/')
                            },
                            view: {
                                backgroundColor: 19860
                            },
                            splash: {
                                assets: 'assets/',
                                lang: 'en',
                                waitTime: 0
                            },
                            timestamp: e.bridge.timestamp
                        }), e.widgets.timestamp || (e.widgets.timestamp = e.bridge.timestamp), e.widgets && e.widgets.portrait && e.widgets.portrait.topBarHeight && (e.widgets.portrait.topBarHeight = 41), e.bridge.inReview || (e.widgets.enabled = !1), e.widgets
                    }
                }])
            }())
            e.exports = i
        },
        887(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = (function () {
                return (0, r.default)(function e() {
                    (0, s.default)(this, e)
                }, null, [{
                    key: 'parse',
                    value(e) {
                        const t = e.bridge.timestamp
                        return e.jackpotPanel || (e.jackpotPanel = {
                            enabled: !1,
                            basePath: ''.concat(e.game.preconfig.cdn, '../../widgets/jackpots/base-jackpot/'),
                            main: 'app.js',
                            styles: 'app.css',
                            timestamp: t,
                            skin: 'base-jackpot',
                            version: 'jackpotNext',
                            hasShuffleAnimation: !1,
                            hasWinAnimation: !1,
                            feedUrl: ''.concat(e.bridge.feedUrl, '/'),
                            assets: 'assets/'
                        }), e.jackpotPanel.feedUrl || (e.jackpotPanel.feedUrl = ''.concat(e.bridge.feedUrl, '/')), e.jackpotPanel.timestamp || (e.jackpotPanel.timestamp = t), e.jackpotPanel.feedInterval = 30, e.jackpotPanel
                    }
                }, {
                    key: 'parseWheel',
                    value(e) {
                        const t = e.bridge.timestamp
                        return e.jackpotWheel = {
                            enabled: !1,
                            basePath: 'games/scenes/jackpot-wheels/base-wheel/',
                            cdn: ''.concat(e.game.preconfig.cdn, '../../../'),
                            skin: 'base-wheel',
                            wheelWinOnly: !0,
                            timestamp: t
                        }, e.jackpotWheel
                    }
                }])
            }())
            e.exports = i
        },
        888(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = (function () {
                return (0, r.default)(function e() {
                    (0, s.default)(this, e)
                }, null, [{
                    key: 'parse',
                    value(e) {
                        const t = e.bridge.timestamp
                        const a = e.server.rgsApi
                        return e.tournament || (e.tournament = {
                            enabled: !1,
                            basePath: ''.concat(e.game.preconfig.cdn, '../../widgets/base-tournament/'),
                            main: 'app.min.js',
                            styles: 'app.min.css',
                            timestamp: t,
                            skin: 'base-tournament',
                            leaderboardUrl: ''.concat(a, 'tournaments/leaderboard/')
                        }), e.tournament.timestamp || (e.tournament.timestamp = t), e.tournament
                    }
                }])
            }())
            e.exports = i
        },
        889(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = n(a(6))
            const o = n(a(382))
            const c = (function () {
                function e() {
                    (0, s.default)(this, e)
                }
                return (0, r.default)(e, null, [{
                    key: 'parseLaunch',
                    value(e, t) {
                        return this.omnibarPath = e.omnibarPath, this.bundlerGameId = e.gameSettings ? e.gameSettings.source : null, t
                    }
                }, {
                    key: 'parse',
                    value(t, a, n) {
                        const s = e.CDN_MAP[n.urlParams.environment || 'production']
                        const r = ''.concat(s, 'games/assets/')
                        const i = ''.concat(s, 'games/localizations/')
                        const c = t.jackpotPanel
                        const u = t.jackpotWheel
                        const l = t.gamble
                        const p = t.bonus
                        const g = t.widgets
                        const d = t.bridge.provider === 'stars' ? ''.concat(t.bridge.cdn, 'gameloader') : ''.concat(t.bridge.cdn, 'core')
                        const f = this.bundlerGameId ? ''.concat(t.bridge.cdn, 'games.').concat(this.bundlerGameId) : ''.concat(t.bridge.cdn, 'games.').concat(t.server.launchParams.gameId)
                        const h = this.bundlerGameId ? this.bundlerGameId : t.server.launchParams.gameId
                        let m = t.server.launchParams.userData.lang
                        m ? ['zh-TW', 'es-PE', 'pt-BR', 'fr-CA'].includes(m) || (m = m.substr(0, 2)) : (console.warn('[bridge] #BundleParser: unsupported lang '.concat(m, ', falling back to \'en\'!')), m = 'en')
                        const b = com.casino && com.casino.bundler || {}
                        const _ = b.isBundlerV2Build
                        const y = b.assetsCDN
                        if (m && e.langsMapping.hasOwnProperty(m) && (m = e.langsMapping[m]), t.bars.basePath = _ ? ''.concat(y, '/games.bars-next/') : n.urlParams.barsURL || ''.concat(d, '/games.bars-next/'), this.isBarsMapped = o.default.some((e) => {
                            return t.server.launchParams.gameId.toLowerCase().startsWith(e.toLowerCase())
                        }), this.isBarsMapped && (t.bars.basePath = t.bars.basePath.replace('bars-next', 'bars-table')), t.bridge.localizationsPath = i, t.bars.localizationsPath = i, t.bars.options.historySrc = ''.concat(d, '/games.history/'), t.bars.assetsPath = r, t.game.preconfig.cdn = _ ? ''.concat(y, '/games.').concat(h, '.').concat(m, '/') : ''.concat(f, '.').concat(m, '/'), t.game.preconfig.forceResolution = 'MD', t.game.preconfig.gameAppId = t.server.launchParams.gameId, t.game.preconfig.isBundleEnv = !0, _ && (t.game.preconfig.isBundlerV2Build = !0), _ && (t.game.preconfig.bundlerGameId = this.bundlerGameId), n.isCayetano) {
                            const v = this.omnibarPath || ''.concat(d, '/games.omnibar/')
                            t.game.preconfig.cdn = ''.concat(f, '/'), t.game.preconfig.dependencies = {
                                game: ''.concat(f, '/'),
                                lang: ''.concat(f, '.').concat(m, '/'),
                                omnibar: v
                            }
                        }
                        if (t.widgets) {
                            g.panel.base = ''.concat(d, '/games.widgets.panel/')
                            const T = t.widgets.tournaments
                            if (T) {
                                const k = T.base.match(/widgets\/(.+)\//)
                                k && k[1] && (T.base = ''.concat(d, '/games.widgets.').concat(k[1], '/'))
                            }
                        }
                        if (u) {
                            const P = !n.isCayetano && !u.wheelWinOnly ? u.skin : 'base-wheel'
                            u.cdn = ''.concat(f, '/'), u.basePath = _ ? ''.concat(y, '/games.scenes.jackpot-wheels.').concat(P, '/') : ''.concat(d, '/games.scenes.jackpot-wheels.').concat(P, '/')
                        }
                        return c && (c.basePath = _ ? ''.concat(y, '/games.widgets.jackpots.').concat(c.skin, '/') : ''.concat(d, '/games.widgets.jackpots.').concat(c.skin, '/')), p && (p.basePath = ''.concat(d, '/games.widgets.bonus/'), p.assetsPath = r, window.com.casino.bonusPath = p.basePath), l && (l.basePath = ''.concat(_ ? y : d, '/games.gambles.pie/'), window.com.casino.piePath = ''.concat(d, '/games.gambles.pie/')), t
                    }
                }])
            }());
            (0, i.default)(c, 'defaultLang', 'en'), (0, i.default)(c, 'langsMapping', {
                cf: 'fr-CA'
            }), (0, i.default)(c, 'CDN_MAP', {
                dev: 'https://cdn.dopamine-gaming.com/dev/',
                production: 'https://cdn-eu.cloudedge.info/all/'
            }), e.exports = c
        },
        890(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(6))
            const r = n(a(3))
            const i = n(a(4))

            function o(e, t) {
                const a = Object.keys(e)
                if (Object.getOwnPropertySymbols) {
                    let n = Object.getOwnPropertySymbols(e)
                    t && (n = n.filter((t) => {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable
                    })), a.push.apply(a, n)
                }
                return a
            }
            const c = (function () {
                return (0, i.default)(function e() {
                    (0, r.default)(this, e)
                }, null, [{
                    key: 'parseLaunch',
                    value(e) {
                        return {
                            gaTrackingIds: e.gaTrackingIds
                        }
                    }
                }, {
                    key: 'parse',
                    value(e) {
                        return e.analytics = (function (e) {
                            for (let t = 1; t < arguments.length; t++) {
                                var a = arguments[t] != null ? arguments[t] : {}
                                t % 2
                                    ? o(new Object(a), !0).forEach((t) => {
                                            (0, s.default)(e, t, a[t])
                                        })
                                    : Object.getOwnPropertyDescriptors
                                        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
                                        : o(new Object(a)).forEach((t) => {
                                                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
                                            })
                            }
                            return e
                        }({
                            gaTrackingIds: [],
                            sendUsageData: !0,
                            isFake: !1
                        }, e.analytics)), e.analytics
                    }
                }])
            }())
            e.exports = c
        },
        891(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = a(238)
            const o = a(892)
            let c = !1
            const u = (function () {
                return (0, r.default)(function e() {
                    (0, s.default)(this, e)
                }, null, [{
                    key: 'parseLaunch',
                    value(e) {
                        return {
                            rgsApi: e.platform,
                            launchParams: {
                                gameId: e.gameId,
                                lang: e.lang
                            }
                        }
                    }
                }, {
                    key: 'parse',
                    value(e) {
                        return c || (c = !0, e.server.launchParams.userData = i(e.server.launchParams.userData, {
                            fingerprint: o()
                        })), e.server
                    }
                }])
            }())
            e.exports = u
        },
        892(e, t, a) {
            'use strict'
            const n = a(1)(a(53))
            const s = a(902)
            const r = s.v4
            const i = s.v1
            const o = a(26)
            let c = !1
            const u = [{
                'info-texts': r()
            }, {
                reels: r()
            }, {
                'timer._': r()
            }]
            const l = o.getBrowser().name
            e.exports = function () {
                const e = localStorage.getItem('#rtg_t@ken::user_f1ng@rpr1nt')
                let t = localStorage.getItem('::_sounds.')
                if (t) {
                    const a = o.decrypt('::_sounds.', t)
                    t = a.includes('=#') ? a : t
                } else { t = r()
                }
                if (e && (t = e, localStorage.removeItem('#rtg_t@ken::user_f1ng@rpr1nt')), t.includes('=#')) {
                    for (var s = t.split('=#'), p = !0, g = 0; g < u.length; g++) {
                        const d = Object.keys(u[g])[0]
                        const f = localStorage.getItem(d) || r()
                        u[g][d] = f, f !== s[g + 2] && (p = !1)
                    }
                    t = s[1] === l && p ? s[0] : r()
                }
                const h = ''.concat(t).concat('=#').concat(l).concat('=#').concat(u.reduce((e, t) => {
                    return [].concat((0, n.default)(e), [Object.values(t).map((e) => {
                        return e
                    })])
                }, []).join('=#'))
                if (localStorage.getItem('::_sounds.') || localStorage.setItem('::_sounds.', o.crypt('::_sounds.', h)), u.forEach((e) => {
                    const t = Object.keys(e)[0]
                    const a = e[t]
                    localStorage.getItem(t) || localStorage.setItem(t, a)
                }), !c) {
                    const m = i() + r()
                    document.cookie = 'userId='.concat(m), c = !0
                }
                return t
            }
        },
        893(e, t, a) {
            'use strict'
            const n = a(1)
            const s = n(a(3))
            const r = n(a(4))
            const i = n(a(6))
            const o = (function () {
                function e() {
                    (0, s.default)(this, e)
                }
                return (0, r.default)(e, null, [{
                    key: 'parse',
                    value(t, a, n) {
                        return t.errors = {
                            connection: {
                                nonRecoverable: Boolean(n.isNetent) || Boolean(n.isRTG && n.isTable)
                            },
                            list: e.errors.map((e) => {
                                return {
                                    match: e,
                                    type: 'operator',
                                    isSilent: !0
                                }
                            })
                        }, t.errors
                    }
                }])
            }());
            (0, i.default)(o, 'errors', ['TypeError: Cannot read property \'wrapperResponse\' of undefined', 'Cannot read property \'wrapperResponse\' of undefined', 'Cannot read property "wrapperResponse" of undefined', 'vanillaApp is not defined', 'ReferenceError: Can\'t find variable: dla', 'Can\'t find variable: dla', 'ReferenceError: Can\'t find variable: dla', 'Can\'t find variable: dla', 'Uncaught ReferenceError: dla is not defined', 'dla is not defined', 'Uncaught ReferenceError: require is not defined', 'ReferenceError: require is not defined', 'Android wrapper script already exist', 'Uncaught ReferenceError: jBone is not defined', 'jBone is not defined', 'TypeError: Cannot read property \'h\' of undefined', 'Cannot read property \'h\' of undefined', 'Uncaught InvalidStateError: Failed to read the \'responseText\' property from \'XMLHttpRequest\'', 'Failed to read the \'responseText\' property from \'XMLHttpRequest\'', 'news_page', 'The current window does not have permission to navigate the target frame to \'https://www.volcanobet.me//casino\'', 'https://m.volcanobet.me//casino', 'ReferenceError: Can\'t find variable: AppSwitched', 'Can\'t find variable: AppSwitched', 'TypeError: undefined is not an object (evaluating \'document.getElementsByClassName(\'gotya1\')[0].value\')', 'TypeError: undefined is not an object (evaluating \'document.getElementsByClassName(\'gotya2\')[0].value\')', 'ReferenceError: Can\'t find variable: UserInfo', 'ReferenceError: Can\'t find variable: PlatformJWTManager', 'Uncaught ReferenceError: AppCallbackInterface is not defined', 'TypeError: undefined is not an object (evaluating \'window.ucbrowser.smWeather.changecity\')', 'window.ucbrowser.smWeather.changecity', 'ReferenceError: Can\'t find variable: AppInterface', 'ReferenceError: Can\'t find variable: onGetInfoComplete_v2', 'Uncaught ReferenceError: x5onSkinSwitch is not defined', 'TypeError: undefined is not an object (evaluating \'SogouMse.videoPauseTool.pauseVideo\')', 'SogouMse.videoPauseTool.pauseVideo', 'ReferenceError: Can\'t find variable: AppRestored', 'TypeError: null is not an object (evaluating \'window.mttLongPressVar.tagName\')', 'window.mttLongPressVar.tagName', 'JSON Parse error: Unexpected identifier "object', 't.unbind is not a function', 'Cannot read property \'gameResized\' of null', 'this.commonUI is null', 'angular is not defined', 'Could not find a theme for operator defaultTheme, reverting to default theme', 'Get source language error: received empty value or error callback from getPageLanguage', 'window.realWalletUpdate is not a function.', 'window.bonusWalletUpdate is not a function', 'TypeError: Failed to fetch', 'TypeError: NetworkError when attempting to fetch resource.', 'TypeError: Cancelled', 'ReferenceError: Can\'t find variable: WH', 'Can\'t find variable: WH', 'WebGL not available for compressed textures. Silently failing.', 'InvalidStateError: Failed to start the audio device', '[bridge] #refreshBalance: userBalance request failed!', 'Error: Method not found']), e.exports = o
        },
        902(e, t, a) {
            'use strict'
            let n
            a.r(t), a.d(t, 'v1', () => {
                return h
            }), a.d(t, 'v3', () => {
                return R
            }), a.d(t, 'v4', () => {
                return I
            }), a.d(t, 'v5', () => {
                return E
            }), a.d(t, 'NIL', () => {
                return w
            }), a.d(t, 'version', () => {
                return N
            }), a.d(t, 'validate', () => {
                return o
            }), a.d(t, 'stringify', () => {
                return g
            }), a.d(t, 'parse', () => {
                return m
            })
            const s = new Uint8Array(16)

            function r() {
                if (!n && !(n = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto))) throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported')
                return n(s)
            }
            const i = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i
            for (var o = function (e) {
                    return typeof e == 'string' && i.test(e)
                }, c = [], u = 0; u < 256; ++u) c.push((u + 256).toString(16).substr(1))
            let l; let p; var g = function (e) {
                const t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
                const a = (`${c[e[t + 0]] + c[e[t + 1]] + c[e[t + 2]] + c[e[t + 3]]}-${c[e[t + 4]]}${c[e[t + 5]]}-${c[e[t + 6]]}${c[e[t + 7]]}-${c[e[t + 8]]}${c[e[t + 9]]}-${c[e[t + 10]]}${c[e[t + 11]]}${c[e[t + 12]]}${c[e[t + 13]]}${c[e[t + 14]]}${c[e[t + 15]]}`).toLowerCase()
                if (!o(a)) throw new TypeError('Stringified UUID is invalid')
                return a
            }
            let d = 0
            let f = 0
            var h = function (e, t, a) {
                let n = t && a || 0
                const s = t || Array.from({ length: 16 })
                let i = (e = e || {}).node || l
                let o = void 0 !== e.clockseq ? e.clockseq : p
                if (i == null || o == null) {
                    const c = e.random || (e.rng || r)()
                    i == null && (i = l = [1 | c[0], c[1], c[2], c[3], c[4], c[5]]), o == null && (o = p = 16383 & (c[6] << 8 | c[7]))
                }
                let u = void 0 !== e.msecs ? e.msecs : Date.now()
                let h = void 0 !== e.nsecs ? e.nsecs : f + 1
                const m = u - d + (h - f) / 1e4
                if (m < 0 && void 0 === e.clockseq && (o = o + 1 & 16383), (m < 0 || u > d) && void 0 === e.nsecs && (h = 0), h >= 1e4) throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec')
                d = u, f = h, p = o
                const b = (1e4 * (268435455 & (u += 122192928e5)) + h) % 4294967296
                s[n++] = b >>> 24 & 255, s[n++] = b >>> 16 & 255, s[n++] = b >>> 8 & 255, s[n++] = 255 & b
                const _ = u / 4294967296 * 1e4 & 268435455
                s[n++] = _ >>> 8 & 255, s[n++] = 255 & _, s[n++] = _ >>> 24 & 15 | 16, s[n++] = _ >>> 16 & 255, s[n++] = o >>> 8 | 128, s[n++] = 255 & o
                for (let y = 0; y < 6; ++y) s[n + y] = i[y]
                return t || g(s)
            }
            var m = function (e) {
                if (!o(e)) throw new TypeError('Invalid UUID')
                let t; const a = new Uint8Array(16)
                return a[0] = (t = Number.parseInt(e.slice(0, 8), 16)) >>> 24, a[1] = t >>> 16 & 255, a[2] = t >>> 8 & 255, a[3] = 255 & t, a[4] = (t = Number.parseInt(e.slice(9, 13), 16)) >>> 8, a[5] = 255 & t, a[6] = (t = Number.parseInt(e.slice(14, 18), 16)) >>> 8, a[7] = 255 & t, a[8] = (t = Number.parseInt(e.slice(19, 23), 16)) >>> 8, a[9] = 255 & t, a[10] = (t = Number.parseInt(e.slice(24, 36), 16)) / 1099511627776 & 255, a[11] = t / 4294967296 & 255, a[12] = t >>> 24 & 255, a[13] = t >>> 16 & 255, a[14] = t >>> 8 & 255, a[15] = 255 & t, a
            }
            const b = function (e, t, a) {
                function n(e, n, s, r) {
                    if (typeof e == 'string' && (e = (function (e) {
                        e = unescape(encodeURIComponent(e))
                        for (var t = [], a = 0; a < e.length; ++a) t.push(e.charCodeAt(a))
                        return t
                    }(e))), typeof n == 'string' && (n = m(n)), n.length !== 16) { throw new TypeError('Namespace must be array-like (16 iterable integer values, 0-255)')
                    }
                    let i = new Uint8Array(16 + e.length)
                    if (i.set(n), i.set(e, n.length), (i = a(i))[6] = 15 & i[6] | t, i[8] = 63 & i[8] | 128, s) {
                        r = r || 0
                        for (let o = 0; o < 16; ++o) s[r + o] = i[o]
                        return s
                    }
                    return g(i)
                }
                try {
                    n.name = e
                } catch (e) {}
                return n.DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8', n.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8', n
            }

            function _(e) {
                return 14 + (e + 64 >>> 9 << 4) + 1
            }

            function y(e, t) {
                const a = (65535 & e) + (65535 & t)
                return (e >> 16) + (t >> 16) + (a >> 16) << 16 | 65535 & a
            }

            function v(e, t, a, n, s, r) {
                return y((i = y(y(t, e), y(n, r))) << (o = s) | i >>> 32 - o, a)
                let i, o
            }

            function T(e, t, a, n, s, r, i) {
                return v(t & a | ~t & n, e, t, s, r, i)
            }

            function k(e, t, a, n, s, r, i) {
                return v(t & n | a & ~n, e, t, s, r, i)
            }

            function P(e, t, a, n, s, r, i) {
                return v(t ^ a ^ n, e, t, s, r, i)
            }

            function O(e, t, a, n, s, r, i) {
                return v(a ^ (t | ~n), e, t, s, r, i)
            }
            var R = b('v3', 48, (e) => {
                if (typeof e == 'string') {
                    const t = unescape(encodeURIComponent(e))
                    e = new Uint8Array(t.length)
                    for (let a = 0; a < t.length; ++a) e[a] = t.charCodeAt(a)
                }
                return (function (e) {
                    for (var t = [], a = 32 * e.length, n = 0; n < a; n += 8) {
                        const s = e[n >> 5] >>> n % 32 & 255
                        const r = Number.parseInt('0123456789abcdef'.charAt(s >>> 4 & 15) + '0123456789abcdef'.charAt(15 & s), 16)
                        t.push(r)
                    }
                    return t
                }(function (e, t) {
                    e[t >> 5] |= 128 << t % 32, e[_(t) - 1] = t
                    for (var a = 1732584193, n = -271733879, s = -1732584194, r = 271733878, i = 0; i < e.length; i += 16) {
                        const o = a
                        const c = n
                        const u = s
                        const l = r
                        a = T(a, n, s, r, e[i], 7, -680876936), r = T(r, a, n, s, e[i + 1], 12, -389564586), s = T(s, r, a, n, e[i + 2], 17, 606105819), n = T(n, s, r, a, e[i + 3], 22, -1044525330), a = T(a, n, s, r, e[i + 4], 7, -176418897), r = T(r, a, n, s, e[i + 5], 12, 1200080426), s = T(s, r, a, n, e[i + 6], 17, -1473231341), n = T(n, s, r, a, e[i + 7], 22, -45705983), a = T(a, n, s, r, e[i + 8], 7, 1770035416), r = T(r, a, n, s, e[i + 9], 12, -1958414417), s = T(s, r, a, n, e[i + 10], 17, -42063), n = T(n, s, r, a, e[i + 11], 22, -1990404162), a = T(a, n, s, r, e[i + 12], 7, 1804603682), r = T(r, a, n, s, e[i + 13], 12, -40341101), s = T(s, r, a, n, e[i + 14], 17, -1502002290), n = T(n, s, r, a, e[i + 15], 22, 1236535329), a = k(a, n, s, r, e[i + 1], 5, -165796510), r = k(r, a, n, s, e[i + 6], 9, -1069501632), s = k(s, r, a, n, e[i + 11], 14, 643717713), n = k(n, s, r, a, e[i], 20, -373897302), a = k(a, n, s, r, e[i + 5], 5, -701558691), r = k(r, a, n, s, e[i + 10], 9, 38016083), s = k(s, r, a, n, e[i + 15], 14, -660478335), n = k(n, s, r, a, e[i + 4], 20, -405537848), a = k(a, n, s, r, e[i + 9], 5, 568446438), r = k(r, a, n, s, e[i + 14], 9, -1019803690), s = k(s, r, a, n, e[i + 3], 14, -187363961), n = k(n, s, r, a, e[i + 8], 20, 1163531501), a = k(a, n, s, r, e[i + 13], 5, -1444681467), r = k(r, a, n, s, e[i + 2], 9, -51403784), s = k(s, r, a, n, e[i + 7], 14, 1735328473), n = k(n, s, r, a, e[i + 12], 20, -1926607734), a = P(a, n, s, r, e[i + 5], 4, -378558), r = P(r, a, n, s, e[i + 8], 11, -2022574463), s = P(s, r, a, n, e[i + 11], 16, 1839030562), n = P(n, s, r, a, e[i + 14], 23, -35309556), a = P(a, n, s, r, e[i + 1], 4, -1530992060), r = P(r, a, n, s, e[i + 4], 11, 1272893353), s = P(s, r, a, n, e[i + 7], 16, -155497632), n = P(n, s, r, a, e[i + 10], 23, -1094730640), a = P(a, n, s, r, e[i + 13], 4, 681279174), r = P(r, a, n, s, e[i], 11, -358537222), s = P(s, r, a, n, e[i + 3], 16, -722521979), n = P(n, s, r, a, e[i + 6], 23, 76029189), a = P(a, n, s, r, e[i + 9], 4, -640364487), r = P(r, a, n, s, e[i + 12], 11, -421815835), s = P(s, r, a, n, e[i + 15], 16, 530742520), n = P(n, s, r, a, e[i + 2], 23, -995338651), a = O(a, n, s, r, e[i], 6, -198630844), r = O(r, a, n, s, e[i + 7], 10, 1126891415), s = O(s, r, a, n, e[i + 14], 15, -1416354905), n = O(n, s, r, a, e[i + 5], 21, -57434055), a = O(a, n, s, r, e[i + 12], 6, 1700485571), r = O(r, a, n, s, e[i + 3], 10, -1894986606), s = O(s, r, a, n, e[i + 10], 15, -1051523), n = O(n, s, r, a, e[i + 1], 21, -2054922799), a = O(a, n, s, r, e[i + 8], 6, 1873313359), r = O(r, a, n, s, e[i + 15], 10, -30611744), s = O(s, r, a, n, e[i + 6], 15, -1560198380), n = O(n, s, r, a, e[i + 13], 21, 1309151649), a = O(a, n, s, r, e[i + 4], 6, -145523070), r = O(r, a, n, s, e[i + 11], 10, -1120210379), s = O(s, r, a, n, e[i + 2], 15, 718787259), n = O(n, s, r, a, e[i + 9], 21, -343485551), a = y(a, o), n = y(n, c), s = y(s, u), r = y(r, l)
                    }
                    return [a, n, s, r]
                }((function (e) {
                    if (e.length === 0) return []
                    for (var t = 8 * e.length, a = new Uint32Array(_(t)), n = 0; n < t; n += 8) a[n >> 5] |= (255 & e[n / 8]) << n % 32
                    return a
                }(e)), 8 * e.length)))
            })
            var I = function (e, t, a) {
                const n = (e = e || {}).random || (e.rng || r)()
                if (n[6] = 15 & n[6] | 64, n[8] = 63 & n[8] | 128, t) {
                    a = a || 0
                    for (let s = 0; s < 16; ++s) t[a + s] = n[s]
                    return t
                }
                return g(n)
            }

            function A(e, t, a, n) {
                switch (e) {
                    case 0:
                        return t & a ^ ~t & n
                    case 1:
                        return t ^ a ^ n
                    case 2:
                        return t & a ^ t & n ^ a & n
                    case 3:
                        return t ^ a ^ n
                }
            }

            function S(e, t) {
                return e << t | e >>> 32 - t
            }
            var E = b('v5', 80, (e) => {
                const t = [1518500249, 1859775393, 2400959708, 3395469782]
                const a = [1732584193, 4023233417, 2562383102, 271733878, 3285377520]
                if (typeof e == 'string') {
                    const n = unescape(encodeURIComponent(e))
                    e = []
                    for (let s = 0; s < n.length; ++s) e.push(n.charCodeAt(s))
                } else { Array.isArray(e) || (e = Array.prototype.slice.call(e))
                }
                e.push(128)
                for (var r = e.length / 4 + 2, i = Math.ceil(r / 16), o = new Array(i), c = 0; c < i; ++c) {
                    for (var u = new Uint32Array(16), l = 0; l < 16; ++l) u[l] = e[64 * c + 4 * l] << 24 | e[64 * c + 4 * l + 1] << 16 | e[64 * c + 4 * l + 2] << 8 | e[64 * c + 4 * l + 3]
                    o[c] = u
                }
                o[i - 1][14] = 8 * (e.length - 1) / 2 ** 32, o[i - 1][14] = Math.floor(o[i - 1][14]), o[i - 1][15] = 8 * (e.length - 1) & 4294967295
                for (let p = 0; p < i; ++p) {
                    for (var g = new Uint32Array(80), d = 0; d < 16; ++d) g[d] = o[p][d]
                    for (let f = 16; f < 80; ++f) g[f] = S(g[f - 3] ^ g[f - 8] ^ g[f - 14] ^ g[f - 16], 1)
                    for (var h = a[0], m = a[1], b = a[2], _ = a[3], y = a[4], v = 0; v < 80; ++v) {
                        const T = Math.floor(v / 20)
                        const k = S(h, 5) + A(T, m, b, _) + y + t[T] + g[v] >>> 0
                        y = _, _ = b, b = S(m, 30) >>> 0, m = h, h = k
                    }
                    a[0] = a[0] + h >>> 0, a[1] = a[1] + m >>> 0, a[2] = a[2] + b >>> 0, a[3] = a[3] + _ >>> 0, a[4] = a[4] + y >>> 0
                }
                return [a[0] >> 24 & 255, a[0] >> 16 & 255, a[0] >> 8 & 255, 255 & a[0], a[1] >> 24 & 255, a[1] >> 16 & 255, a[1] >> 8 & 255, 255 & a[1], a[2] >> 24 & 255, a[2] >> 16 & 255, a[2] >> 8 & 255, 255 & a[2], a[3] >> 24 & 255, a[3] >> 16 & 255, a[3] >> 8 & 255, 255 & a[3], a[4] >> 24 & 255, a[4] >> 16 & 255, a[4] >> 8 & 255, 255 & a[4]]
            })
            var w = '00000000-0000-0000-0000-000000000000'
            var N = function (e) {
                if (!o(e)) throw new TypeError('Invalid UUID')
                return Number.parseInt(e.substr(14, 1), 16)
            }
        }
    }
])