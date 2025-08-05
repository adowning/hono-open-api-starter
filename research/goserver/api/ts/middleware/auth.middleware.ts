import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/models';
import { Users } from '../models/store';
import { Cfg } from '../stubs/config';
import { Ret401 } from '../util/errors';
import { AEC } from '../util/errors';

// Extend the Express Request interface to include the user property
export interface AuthenticatedRequest extends Request {
    user?: User;
}

const jwtIssuer = "slotopol";

// Claims structure for JWT
interface Claims extends jwt.JwtPayload {
    uid: number;
}

// Auth middleware to protect routes
export const auth = (required: boolean) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const token = extractToken(req);

        if (!token) {
            if (required) {
                return Ret401(res, AEC.AEC_auth_absent, new Error("Authorization is required"));
            }
            return next();
        }

        try {
            const decoded = jwt.verify(token, Cfg.AccessKey, { issuer: jwtIssuer }) as Claims;
            const user = Users.get(decoded.uid);

            if (!user) {
                if (required) {
                    return Ret401(res, AEC.AEC_token_nouser, new Error("Invalid user in token"));
                }
                return next();
            }

            req.user = user;
            next();
        } catch (err) {
            if (required) {
                return Ret401(res, AEC.AEC_token_error, new Error("Invalid token"));
            }
            next();
        }
    };
};

// Function to extract token from request (header, query, or cookie)
function extractToken(req: Request): string | null {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        return req.headers.authorization.substring(7);
    }
    if (req.query.token && typeof req.query.token === 'string') {
        return req.query.token;
    }
    // In a real app, you might check cookies as well
    // if (req.cookies.token) {
    //     return req.cookies.token;
    // }
    return null;
}
