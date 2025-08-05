import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Clubs, Users, Scenes } from '../models/store';
import { AL } from '../models/models';
import { Ret400, Ret403, Ret404, AEC, ErrNoUser, ErrNoClub, ErrNoAccess, ErrNoAliase, ErrNotOpened } from '../util/errors';
import { CreateScene, GetScene, GetRTP } from '../util/logic';
import { InfoMap, AlgList, GameFactory } from '../stubs/game';


// GET /game/list
export function apiGameList(req: AuthenticatedRequest, res: Response) {
    // Simplified version of the Go implementation
    const gameList = Object.values(InfoMap);
    res.json({
        list: gameList,
        algnum: AlgList.length,
        prvnum: new Set(gameList.map(g => g.Prov)).size
    });
}

// POST /game/new
export function apiGameNew(req: AuthenticatedRequest, res: Response) {
    const { cid, uid, alias } = req.body;
    const admin = req.user;

    if (!cid || !uid || !alias) {
        return Ret400(res, AEC.AEC_game_new_nobind, new Error("cid, uid, and alias are required"));
    }

    const club = Clubs.get(cid);
    if (!club) {
        return Ret404(res, AEC.AEC_game_new_noclub, ErrNoClub);
    }

    const user = Users.get(uid);
    if (!user) {
        return Ret404(res, AEC.AEC_game_new_nouser, ErrNoUser);
    }

    // Authorization
    const userAccess = user.getAL(cid);
    if (!(userAccess & AL.MEMBER) || (admin.uid !== user.uid && !(admin.getAL(cid) & AL.DEALER))) {
        return Ret403(res, AEC.AEC_game_new_noaccess, ErrNoAccess);
    }

    if (!GameFactory[alias.toLowerCase()]) {
        return Ret400(res, AEC.AEC_game_new_noalias, ErrNoAliase);
    }

    const scene = CreateScene(cid, uid, alias);
    if (!scene) {
        // This should not happen if the checks above pass
        return Ret500(res, AEC.AEC_game_new_sql, new Error("Failed to create scene"));
    }

    res.json({
        gid: scene.GID,
        game: scene.game,
        wallet: user.getWallet(cid),
    });
}

// POST /game/join
export function apiGameJoin(req: AuthenticatedRequest, res: Response) {
    const { cid, uid, gid } = req.body;
    const admin = req.user;

    if (!cid || !uid || !gid) {
        return Ret400(res, AEC.AEC_game_join_nobind, new Error("cid, uid, and gid are required"));
    }

    const user = Users.get(uid);
    if (!user) {
        return Ret404(res, AEC.AEC_game_join_nouser, ErrNoUser);
    }

    // Authorization
    const userAccess = user.getAL(cid);
    if (!(userAccess & AL.MEMBER) || (admin.uid !== user.uid && !(admin.getAL(cid) & AL.DEALER))) {
        return Ret403(res, AEC.AEC_game_join_noaccess, ErrNoAccess);
    }

    const scene = GetScene(gid);
    if (!scene) {
        return Ret404(res, AEC.AEC_game_join_noscene, ErrNotOpened);
    }

    res.json({
        gid: scene.GID,
        game: scene.game,
        wallet: user.getWallet(cid),
    });
}

// POST /game/info
export function apiGameInfo(req: AuthenticatedRequest, res: Response) {
    const { gid } = req.body;
    const admin = req.user;

    if (!gid) {
        return Ret400(res, AEC.AEC_game_info_nobind, new Error("gid is required"));
    }

    const scene = GetScene(gid);
    if (!scene) {
        return Ret404(res, AEC.AEC_game_info_noscene, ErrNotOpened);
    }

    const user = Users.get(scene.UID);
    if (!user) {
        return Ret500(res, AEC.AEC_game_info_nouser, ErrNoUser); // Should not happen if scene exists
    }

    // Authorization
    if (admin.uid !== user.uid && !(admin.getAL(scene.CID) & AL.DEALER)) {
        return Ret403(res, AEC.AEC_game_info_noaccess, ErrNoAccess);
    }

    res.json({
        gid: scene.GID,
        alias: scene.Alias,
        cid: scene.CID,
        uid: scene.UID,
        sid: scene.sid,
        game: scene.game,
        wallet: user.getWallet(scene.CID),
    });
}

// GET /game/rtp/get
export function apiGameRtpGet(req: AuthenticatedRequest, res: Response) {
    // Simplified - assuming GID is in query
    const gid = parseInt(req.query.gid as string);
    const admin = req.user;

    if (!gid) {
        return Ret400(res, AEC.AEC_game_rtpget_nobind, new Error("gid is required"));
    }

    const scene = GetScene(gid);
    if (!scene) {
        return Ret404(res, AEC.AEC_game_rtpget_noscene, ErrNotOpened);
    }

    const user = Users.get(scene.UID);
    if (!user) {
        return Ret500(res, AEC.AEC_game_rtpget_nouser, ErrNoUser);
    }

    // Authorization
    if (admin.uid !== user.uid && !(admin.getAL(scene.CID) & AL.DEALER)) {
        return Ret403(res, AEC.AEC_game_rtpget_noaccess, ErrNoAccess);
    }

    const mrtp = GetRTP(user, scene.CID);
    const gi = InfoMap[scene.Alias.toLowerCase()];
    const rtp = gi ? gi.FindClosest(mrtp) : mrtp;

    res.json({
        mrtp: mrtp,
        rtp: rtp,
    });
}
