import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Clubs, Users, nextSpinId } from '../models/store';
import { AL } from '../models/models';
import { Ret400, Ret403, Ret404, AEC, ErrNoUser, ErrNoClub, ErrNoAccess, ErrNotSlot, ErrNoMoney, ErrBadBank, ErrNoGain } from '../util/errors';
import { GetScene, GetRTP } from '../util/logic';
import { SlotGame } from '../stubs/game';
import { Cfg } from '../stubs/config';

// Helper function to get the slot game from a scene
function getSlotGame(gid: number): SlotGame | null {
    const scene = GetScene(gid);
    if (!scene) return null;
    // Type guard to check if it's a SlotGame
    if (typeof (scene.game as SlotGame).getBet !== 'function') {
        return null;
    }
    return scene.game as SlotGame;
}

// POST /slot/bet/set
export function apiSlotBetSet(req: AuthenticatedRequest, res: Response) {
    const { gid, bet } = req.body;
    const game = getSlotGame(gid);
    if (!game) {
        return Ret404(res, AEC.AEC_slot_betset_noscene, ErrNotSlot);
    }
    const err = game.setBet(bet);
    if (err) {
        return Ret403(res, AEC.AEC_slot_betset_badbet, err);
    }
    res.status(204).send();
}

// POST /slot/sel/set
export function apiSlotSelSet(req: AuthenticatedRequest, res: Response) {
    const { gid, sel } = req.body;
    const game = getSlotGame(gid);
    if (!game) {
        return Ret404(res, AEC.AEC_slot_selset_noscene, ErrNotSlot);
    }
    const err = game.setSel(sel);
    if (err) {
        return Ret403(res, AEC.AEC_slot_selset_badsel, err);
    }
    res.status(204).send();
}

// POST /slot/spin
export function apiSlotSpin(req: AuthenticatedRequest, res: Response) {
    const { gid } = req.body;
    const admin = req.user;

    const scene = GetScene(gid);
    if (!scene) {
        return Ret404(res, AEC.AEC_slot_spin_noscene, ErrNotSlot);
    }
    const game = getSlotGame(gid);
    if (!game) {
        return Ret403(res, AEC.AEC_slot_spin_notslot, ErrNotSlot);
    }

    const club = Clubs.get(scene.CID);
    if (!club) {
        return Ret500(res, AEC.AEC_slot_spin_noclub, ErrNoClub);
    }

    const user = Users.get(scene.UID);
    if (!user) {
        return Ret500(res, AEC.AEC_slot_spin_nouser, ErrNoUser);
    }

    const props = user.props.get(scene.CID);
    if (!props) {
        return Ret500(res, AEC.AEC_slot_spin_noprops, new Error("Props not found"));
    }

    const [cost, isjp] = game.cost();

    if (props.wallet < cost) {
        return Ret403(res, AEC.AEC_slot_spin_nomoney, ErrNoMoney);
    }

    const mrtp = GetRTP(user, scene.CID);

    // Simplified spin logic
    const wins = { gain: 0, jackpot: 0, Gain: () => 0, Jackpot: () => 0, Reset: () => {} };
    let n = 0;
    while(true) {
        game.spin(mrtp);
        if (game.scanner(wins) === null) break;
        n++;
        if (n > Cfg.MaxSpinAttempts) {
            return Ret500(res, AEC.AEC_slot_spin_badbank, ErrBadBank);
        }
    }

    // In a real scenario, we would calculate debit and update bank
    const debit = cost - wins.gain;
    club.bank += debit;
    props.wallet += wins.gain - cost;
    game.apply(wins);

    scene.sid = nextSpinId();

    res.json({
        sid: scene.sid,
        game: game,
        wins: wins,
        wallet: props.wallet,
        jpfund: club.fund,
    });
}

// POST /slot/doubleup
export function apiSlotDoubleup(req: AuthenticatedRequest, res: Response) {
    const { gid, mult, half } = req.body;

    const scene = GetScene(gid);
    const game = getSlotGame(gid);
    if (!scene || !game) {
        return Ret404(res, AEC.AEC_slot_doubleup_noscene, ErrNotSlot);
    }

    const club = Clubs.get(scene.CID);
    const user = Users.get(scene.UID);
    const props = user.props.get(scene.CID);

    const oldGain = game.getGain();
    if (oldGain <= 0) {
        return Ret403(res, AEC.AEC_slot_doubleup_nogain, ErrNoGain);
    }

    const risk = half ? oldGain / 2 : oldGain;
    const mrtp = GetRTP(user, scene.CID);

    let win = false;
    let upgain = 0;
    if (club.bank >= risk * mult) {
        if (Math.random() < (1 / mult * mrtp / 100)) {
            win = true;
            upgain = risk * mult;
        }
    }

    const debit = risk - upgain;
    const newGain = oldGain - risk + upgain;

    club.bank += debit;
    props.wallet -= debit;
    game.setGain(newGain);

    res.json({
        id: nextSpinId(),
        win,
        risk,
        gain: newGain,
        wallet: props.wallet,
    });
}

// POST /slot/collect
export function apiSlotCollect(req: AuthenticatedRequest, res: Response) {
    const { gid } = req.body;
    const game = getSlotGame(gid);
    if (!game) {
        return Ret404(res, AEC.AEC_slot_collect_noscene, ErrNotSlot);
    }
    game.setGain(0);
    res.json({});
}
