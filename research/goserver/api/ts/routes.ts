import { Router } from 'express';
import * as system from './controllers/system.controller';
import * as authController from './controllers/auth.controller';
import * as user from './controllers/user.controller';
import * as game from './controllers/game.controller';
import * as slot from './controllers/slot.controller';
import * as keno from './controllers/keno.controller';
import * as props from './controllers/props.controller';
import * as club from './controllers/club.controller';
import { auth } from './middleware/auth.middleware';

const router = Router();

// System routes
router.get('/ping', system.apiPing);
router.get('/servinfo', system.apiServInfo);
router.get('/memusage', system.apiMemUsage);

// Authorization routes
router.post('/signin', authController.apiSignin);
router.post('/signup', auth(false), authController.apiSignup);
router.get('/refresh', auth(true), authController.apiRefresh);
router.get('/signis', authController.apiSignis);
router.get('/sendcode', authController.apiSendCode);
router.get('/activate', auth(false), authController.apiActivate);


// Authenticated routes group
const ra = Router();
ra.use(auth(true));

// User routes
ra.post('/user/is', user.apiUserIs);
ra.post('/user/rename', user.apiUserRename);
ra.post('/user/secret', user.apiUserSecret);
ra.post('/user/delete', user.apiUserDelete);

// Game routes (unprotected part)
router.get('/game/list', game.apiGameList);
// Game routes (protected part)
ra.post('/game/new', game.apiGameNew);
ra.post('/game/join', game.apiGameJoin);
ra.post('/game/info', game.apiGameInfo);
ra.get('/game/rtp/get', game.apiGameRtpGet);

// Slot routes
ra.post('/slot/bet/set', slot.apiSlotBetSet);
ra.post('/slot/sel/set', slot.apiSlotSelSet);
ra.post('/slot/spin', slot.apiSlotSpin);
ra.post('/slot/doubleup', slot.apiSlotDoubleup);
ra.post('/slot/collect', slot.apiSlotCollect);
// Placeholders for slot GET routes
ra.post('/slot/bet/get', (req, res) => res.status(501).send("Not Implemented"));
ra.post('/slot/sel/get', (req, res) => res.status(501).send("Not Implemented"));
ra.post('/slot/mode/set', (req, res) => res.status(501).send("Not Implemented"));


// Keno routes
ra.post('/keno/bet/get', keno.apiKenoBetGet);
ra.post('/keno/bet/set', keno.apiKenoBetSet);
ra.post('/keno/sel/get', keno.apiKenoSelGet);
ra.post('/keno/sel/set', keno.apiKenoSelSet);
ra.post('/keno/sel/getslice', keno.apiKenoSelGetSlice);
ra.post('/keno/sel/setslice', keno.apiKenoSelSetSlice);
ra.post('/keno/spin', keno.apiKenoSpin);

// Properties routes
ra.post('/prop/get', props.apiPropsGet);
ra.post('/prop/wallet/get', props.apiPropsWalletGet);
ra.post('/prop/wallet/add', props.apiPropsWalletAdd);
ra.post('/prop/al/get', props.apiPropsAlGet);
ra.post('/prop/al/set', props.apiPropsAlSet);
ra.post('/prop/rtp/get', props.apiPropsRtpGet);
ra.post('/prop/rtp/set', props.apiPropsRtpSet);

// Club routes
ra.post('/club/list', club.apiClubList);
ra.post('/club/is', club.apiClubIs);
ra.post('/club/info', club.apiClubInfo);
ra.post('/club/jpfund', club.apiClubJpfund);
ra.post('/club/rename', club.apiClubRename);
ra.post('/club/cashin', club.apiClubCashin);


// Use the authenticated router group
router.use('/', ra);

export default router;
