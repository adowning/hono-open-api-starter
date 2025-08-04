// file: src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type to include our custom 'user' property
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
    };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("JWT_SECRET is not defined in .env file");
        return res.status(500).json({ error: 'Internal Server Error: JWT secret not configured' });
    }

    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Token is not valid' });
        }
        
        // Attach the decoded user payload (which should contain userId) to the request
        req.user = user;
        next();
    });
};