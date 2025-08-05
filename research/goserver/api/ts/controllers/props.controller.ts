import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Clubs, Users } from '../models/store';
import { AL } from '../models/models';
import { Ret400, Ret403, Ret404, Ret500, AEC, ErrNoUser, ErrNoClub, ErrNoAccess, ErrNoMoney, ErrNoProps } from '../util/errors';
import { Cfg } from '../stubs/config';

// POST /prop/wallet/add
export function apiPropsWalletAdd(req: AuthenticatedRequest, res: Response) {
    const { cid, uid, sum } = req.body;
    const admin = req.user;

    if (!cid || !uid || sum === undefined) {
        return Ret400(res, AEC.AEC_prop_walletadd_nobind, new Error("cid, uid, and sum are required"));
    }

    if (Math.abs(sum) > Cfg.AdjunctLimit) {
        return Ret400(res, AEC.AEC_prop_walletadd_limit, new Error("Sum exceeds limit"));
    }

    const club = Clubs.get(cid);
    if (!club) {
        return Ret404(res, AEC.AEC_prop_walletadd_noclub, ErrNoClub);
    }

    const user = Users.get(uid);
    if (!user) {
        return Ret404(res, AEC.AEC_prop_walletadd_nouser, ErrNoUser);
    }

    // Authorization: Must be a booker
    if (!(admin.getAL(cid) & AL.BOOKER)) {
        return Ret403(res, AEC.AEC_prop_walletadd_noaccess, ErrNoAccess);
    }

    const props = user.props.get(cid);
    if (!props) {
        return Ret500(res, AEC.AEC_prop_walletadd_noprops, ErrNoProps);
    }

    if (props.wallet + sum < 0) {
        return Ret403(res, AEC.AEC_prop_walletadd_nomoney, ErrNoMoney);
    }

    props.wallet += sum;

    res.json({ wallet: props.wallet });
}


// --- Placeholder Functions ---

export function apiPropsGet(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiPropsWalletGet(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiPropsAlGet(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiPropsAlSet(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiPropsRtpGet(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiPropsRtpSet(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}
