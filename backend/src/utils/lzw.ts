const e = '0123456789abcdef'

export function lzwDecode(t) {
    const e = {}
    let i = (t = t.substr(4)).substr(0, 1)
    let n = i
    let s = 256
    const o = [i]
    for (let r = 1; r < t.length; r++) {
        const a = t.charCodeAt(r)
        let l
        l = a < 256 ? t.substr(r, 1) : e[a] ? e[a] : n + i, o.push(l), i = l.substr(0, 1), e[s] = n + i, s++, n = l
    }
    // if (JSON.parse(o.join("")).game) {
    //     if (JSON.parse(o.join("")).game.totalSpinWinnings) {
    //         if (JSON.parse(o.join("")).game.totalSpinWinnings > 0) {
    //             const coins = JSON.parse(o.join("")).game.totalSpinWinnings * 100
    //             // window.parent.supabase.rpc('nolimit_increment_coins', { row_id: window.parent.userId, val: coins }).then((data, error) => {
    //             //     console.log(error)
    //             //     console.log(data)
    //             //     window.top.postMessage('nolimit_increment_coins', '*')
    //             // })
    //         }
    //     }
    // }
    // console.log(o)

    return o.join('')
}
function n(t) {
    const i = encodeURIComponent(t).split('')
    const n = []
    for (let t = 0; t < i.length; t++) i[t] === '%' ? (n.push(e.indexOf(i[t + 1].toLowerCase()) << 4 | e.indexOf(i[t + 2].toLowerCase())), t += 2) : n.push(i[t].charCodeAt(0))
    return n
}
function i(t, e) {
    let i; let n; let s; let o = []
    let r = []
    for (i = 0; i < 256; i++) o[i] = i
    for (i = 0, n = 0; i < 256; i++) n = (n + o[i] + t[i % t.length]) % 256, s = o[i], o[i] = o[n], o[n] = s
    for (let t = 0, i = 0, n = 0; t < e.length; t++) i = (i + 1) % 256, n = (n + o[i]) % 256, s = o[i], o[i] = o[n], o[n] = s, r.push(e[t] ^ o[(o[i] + o[n]) % 256])
    return r
}
export function decrypt(t, s) {
    return (function (t) {
        let i = ''
        for (let n = 0; n < t.length; n++) i += `%${e.charAt(t[n] >> 4 & 15)}${e.charAt(15 & t[n])}`
        return decodeURIComponent(i)
    }(i(n(t), (function (t) {
        if (typeof t != 'string') return []
        const i = []
        const n = t.split('')
        for (let t = 0; t < n.length; t += 2) i.push(e.indexOf(n[t]) << 4 | e.indexOf(n[t + 1]))
        return i
    }(s)))))
}