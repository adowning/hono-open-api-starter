import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Clubs } from '../models/store';

// POST /club/list
export function apiClubList(req: AuthenticatedRequest, res: Response) {
    const clubList = Array.from(Clubs.values()).map(c => ({
        cid: c.cid,
        name: c.name,
    }));
    res.json({ list: clubList });
}

// --- Placeholder Functions ---

export function apiClubIs(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiClubInfo(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiClubJpfund(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiClubRename(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}

export function apiClubCashin(req: AuthenticatedRequest, res: Response) {
    res.status(501).send("Not Implemented");
}
