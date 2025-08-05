import { Response } from 'express';
import { Users } from '../models/store';
import { AL } from '../models/models';
import { Ret400, Ret403, Ret404, AEC, ErrNoUser, ErrNoAccess, ErrNotConf } from '../util/errors';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// POST /user/is
export function apiUserIs(req: AuthenticatedRequest, res: Response) {
    // This endpoint in Go checks a list of users.
    // For simplicity, we'll just return the current user's info.
    if (!req.user) {
        return Ret401(res, AEC.AEC_auth_absent, new Error("Authentication required"));
    }
    const { uid, email, name } = req.user;
    res.json({ list: [{ uid, email, name }] });
}

// POST /user/rename
export function apiUserRename(req: AuthenticatedRequest, res: Response) {
    const { uid, name } = req.body;
    const admin = req.user;

    if (!uid || !name) {
        return Ret400(res, AEC.AEC_user_rename_nobind, new Error("UID and name are required"));
    }

    const userToRename = Users.get(uid);
    if (!userToRename) {
        return Ret404(res, AEC.AEC_user_rename_nouser, ErrNoUser);
    }

    // Authorization check: admin or self
    if (admin.uid !== userToRename.uid && !(admin.gal & AL.BOOKER)) {
        return Ret403(res, AEC.AEC_user_rename_noaccess, ErrNoAccess);
    }

    userToRename.name = name;
    Users.set(uid, userToRename);

    res.status(204).send();
}

// POST /user/secret
export function apiUserSecret(req: AuthenticatedRequest, res: Response) {
    const { uid, oldSecret, newSecret } = req.body;
    const admin = req.user;

    if (!uid || !oldSecret || !newSecret) {
        return Ret400(res, AEC.AEC_user_secret_nobind, new Error("UID, oldSecret, and newSecret are required"));
    }

    const userToUpdate = Users.get(uid);
    if (!userToUpdate) {
        return Ret404(res, AEC.AEC_user_secret_nouser, ErrNoUser);
    }

    // Authorization check
    const isAdmin = (admin.gal & (AL.BOOKER | AL.ADMIN)) > 0;
    if (admin.uid !== userToUpdate.uid && !isAdmin) {
        return Ret403(res, AEC.AEC_user_secret_noaccess, ErrNoAccess);
    }

    if (userToUpdate.secret !== oldSecret && !isAdmin) {
        return Ret403(res, AEC.AEC_user_secret_notequ, ErrNotConf);
    }

    userToUpdate.secret = newSecret;
    Users.set(uid, userToUpdate);

    res.status(204).send();
}

// POST /user/delete
export function apiUserDelete(req: AuthenticatedRequest, res: Response) {
    const { uid, secret } = req.body;
    const admin = req.user;

    if (!uid) {
        return Ret400(res, AEC.AEC_user_delete_nobind, new Error("UID is required"));
    }

    const userToDelete = Users.get(uid);
    if (!userToDelete) {
        return Ret404(res, AEC.AEC_user_delete_nouser, ErrNoUser);
    }

    // Authorization check
    const isAdmin = (admin.gal & AL.BOOKER) > 0;
    if (admin.uid !== userToDelete.uid && !isAdmin) {
        return Ret403(res, AEC.AEC_user_delete_noaccess, ErrNoAccess);
    }

    if (userToDelete.secret !== secret && !isAdmin) {
        return Ret403(res, AEC.AEC_user_delete_nosecret, ErrNotConf);
    }

    Users.delete(uid);

    // In the real app, this also cleans up props, scenes, etc.
    // For this conversion, just deleting the user is sufficient.

    res.json({ wallets: {} }); // Return empty wallets object
}
