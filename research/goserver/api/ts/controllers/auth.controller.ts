import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UF } from '../models/models';
import { Users } from '../models/store';
import { Cfg } from '../stubs/config';
import { Ret400, Ret401, Ret403, AEC } from '../util/errors';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const jwtIssuer = "slotopol";

// Helper to sign a new JWT
function signToken(user: User, key: string, expiresIn: string): string {
    const claims = {
        uid: user.uid,
        iss: jwtIssuer,
    };
    return jwt.sign(claims, key, { expiresIn });
}

// POST /signin
export function apiSignin(req: Request, res: Response) {
    const { email, secret } = req.body;

    if (!email || !secret) {
        return Ret400(res, AEC.AEC_signin_nobind, new Error("Email and secret are required"));
    }

    let user: User | undefined;
    for (const u of Users.values()) {
        if (u.email.toLowerCase() === email.toLowerCase()) {
            user = u;
            break;
        }
    }

    if (!user || user.secret !== secret) {
        return Ret401(res, AEC.AEC_signin_denypass, new Error("Invalid credentials"));
    }

    if (!(user.status & UF.ACTIVATED)) {
        // In the Go code, activation is optional based on config. We'll assume activated for now.
        // For a full implementation, we'd check Cfg.UseActivation
    }

    const accessToken = signToken(user, Cfg.AccessKey, Cfg.AccessTTL);
    const refreshToken = signToken(user, Cfg.RefreshKey, Cfg.RefreshTTL);

    res.json({
        uid: user.uid,
        email: user.email,
        access: accessToken,
        refrsh: refreshToken,
        expire: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Approx. 15m
        living: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Approx. 7d
    });
}

// ANY /refresh
export function apiRefresh(req: AuthenticatedRequest, res: Response) {
    const user = req.user;
    if (!user) {
        return Ret401(res, AEC.AEC_auth_absent, new Error("Authentication required"));
    }

    const accessToken = signToken(user, Cfg.AccessKey, Cfg.AccessTTL);
    const refreshToken = signToken(user, Cfg.RefreshKey, Cfg.RefreshTTL);

    res.json({
        uid: user.uid,
        email: user.email,
        access: accessToken,
        refrsh: refreshToken,
        expire: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        living: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
}


// --- Placeholder Functions ---

// POST /signup
export function apiSignup(req: Request, res: Response) {
    res.status(501).send("Not Implemented");
}

// ANY /signis
export function apiSignis(req: Request, res: Response) {
    res.status(501).send("Not Implemented");
}

// GET /sendcode
export function apiSendCode(req: Request, res: Response) {
    res.status(501).send("Not Implemented");
}

// GET /activate
export function apiActivate(req: Request, res: Response) {
    res.status(501).send("Not Implemented");
}
