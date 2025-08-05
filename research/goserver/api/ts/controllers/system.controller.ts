import { Request, Response } from 'express';
import { Cfg } from '../stubs/config';
import os from 'os';

const startTime = new Date();

// Check service response.
export function apiPing(req: Request, res: Response) {
    res.status(204).send();
}

// Static service system information.
export function apiServInfo(req: Request, res: Response) {
    const ret = {
        buildvers: Cfg.BuildVers,
        buildtime: Cfg.BuildTime,
        started: startTime.toISOString(),
        govers: `node ${process.version}`, // Node.js version instead of Go
        os: process.platform,
        arch: process.arch,
        maxprocs: os.cpus().length,
        cpubrand: os.cpus()[0].model,
        // Other CPU info is not as easily accessible in Node as in Go with cpuid
    };
    res.json(ret);
}

// Memory usage footprint.
export function apiMemUsage(req: Request, res: Response) {
    const mem = process.memoryUsage();
    const ret = {
        buildvers: Cfg.BuildVers,
        buildtime: Cfg.BuildTime,
        running: new Date().getTime() - startTime.getTime(),
        heapalloc: mem.heapUsed,
        heapsys: mem.heapTotal,
        totalalloc: mem.heapUsed, // Not a direct equivalent
        // Other GC stats are not directly available in this manner
    };
    res.json(ret);
}
