import { NewGame } from './arabiannights';
import { ReelsBon } from './arabiannights-bon';
import { ReelsMap } from './arabiannights-reel';
import { Stat, ScanReels5x, FindClosest } from './stubs/slot';

// A simple writer stub to mimic io.Writer
class StringWriter {
    private buffer = "";
    write(s: string) {
        this.buffer += s;
    }
    toString() {
        return this.buffer;
    }
}

export function CalcStatBon(ctx: any): number {
    const reels = ReelsBon;
    const g = NewGame();
    g.Sel = 1;
    g.FSR = 15; // set free spins mode
    const s = new Stat();

    const calc = (w: StringWriter): number => {
        const reshuf = s.Count();
        const cost = g.Sel * g.Bet;
        const lrtp = s.LineRTP(cost);
        const srtp = s.ScatRTP(cost);
        const rtpsym = lrtp + srtp;
        const q = s.FreeCount() / reshuf;
        const sq = 1 / (1 - q);
        const rtp = sq * rtpsym;

        console.log(`symbols: ${lrtp.toPrecision(5)}(lined) + ${srtp.toPrecision(5)}(scatter) = ${rtpsym.toFixed(6)}%`);
        console.log(`free spins ${s.FreeCountU()}, q = ${q.toPrecision(5)}, sq = 1/(1-q) = ${sq.toFixed(6)}`);
        console.log(`free games frequency: 1/${(reshuf / s.FreeHits()).toPrecision(5)}`);
        console.log(`RTP = sq*rtp(sym) = ${sq.toPrecision(5)}*${rtpsym.toPrecision(5)} = ${rtp.toFixed(6)}%`);

        return rtp;
    };

    return ScanReels5x(ctx, s, g, reels, calc);
}

export function CalcStatReg(ctx: any, mrtp: number): number {
    console.log(`*bonus reels calculations*`);
    const rtpfs = CalcStatBon(ctx);
    // In a real scenario, you might check ctx.Err() here
    // if (ctx.Err() != nil) { return 0; }

    console.log(`*regular reels calculations*`);
    const [reels, _] = FindClosest(ReelsMap, mrtp);
    const g = NewGame();
    g.Sel = 1;
    const s = new Stat();

    const calc = (w: StringWriter): number => {
        const reshuf = s.Count();
        const cost = g.Sel * g.Bet;
        const lrtp = s.LineRTP(cost);
        const srtp = s.ScatRTP(cost);
        const rtpsym = lrtp + srtp;
        const q = s.FreeCount() / reshuf;
        const sq = 1 / (1 - q);
        const rtp = rtpsym + q * rtpfs;

        console.log(`symbols: ${lrtp.toPrecision(5)}(lined) + ${srtp.toPrecision(5)}(scatter) = ${rtpsym.toFixed(6)}%`);
        console.log(`free spins ${s.FreeCountU()}, q = ${q.toPrecision(5)}, sq = 1/(1-q) = ${sq.toFixed(6)}`);
        console.log(`free games frequency: 1/${(reshuf / s.FreeHits()).toPrecision(5)}`);
        console.log(`RTP = ${rtpsym.toPrecision(5)}(sym) + ${q.toPrecision(5)}*${rtpfs.toPrecision(5)}(fg) = ${rtp.toFixed(6)}%`);

        return rtp;
    };

    return ScanReels5x(ctx, s, g, reels, calc);
}
