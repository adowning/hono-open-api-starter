import request from 'supertest';
import { app, server } from '../index'; // Import the express app and server

// Close the server after all tests are done
afterAll((done) => {
    server.close(done);
});

describe('Game Play Simulation', () => {
    let admtoken = '';
    let usrtoken = '';
    let gid: number;
    let wallet: number;

    const cid = 1;
    const uid = 3;
    const bet = 1;
    const sel = 5;

    test('should sign in admin and player', async () => {
        // Sign in admin
        const adminRes = await request(app)
            .post('/signin')
            .send({ email: 'admin@example.org', secret: '0YBoaT' });
        expect(adminRes.status).toBe(200);
        admtoken = adminRes.body.access;
        expect(admtoken).toBeDefined();

        // Sign in player
        const playerRes = await request(app)
            .post('/signin')
            .send({ email: 'player@example.org', secret: 'iVI05M' });
        expect(playerRes.status).toBe(200);
        usrtoken = playerRes.body.access;
        expect(usrtoken).toBeDefined();
    });

    test('should create a new game', async () => {
        const res = await request(app)
            .post('/game/new')
            .set('Authorization', `Bearer ${usrtoken}`)
            .send({ cid: cid, uid: uid, alias: 'Novomatic/DolphinsPearl' });

        expect(res.status).toBe(200);
        gid = res.body.gid;
        wallet = res.body.wallet;
        expect(gid).toBeGreaterThan(0);
    });

    test('should set bet and lines', async () => {
        const betRes = await request(app)
            .post('/slot/bet/set')
            .set('Authorization', `Bearer ${usrtoken}`)
            .send({ gid, bet });
        expect(betRes.status).toBe(204);

        const selRes = await request(app)
            .post('/slot/sel/set')
            .set('Authorization', `Bearer ${usrtoken}`)
            .send({ gid, sel });
        expect(selRes.status).toBe(204);
    });

    test('should run a spin loop', async () => {
        // Check wallet and add funds if needed
        if (wallet < bet * sel) {
            const addWalletRes = await request(app)
                .post('/prop/wallet/add')
                .set('Authorization', `Bearer ${admtoken}`)
                .send({ cid, uid, sum: 1000 });
            expect(addWalletRes.status).toBe(200);
            wallet = addWalletRes.body.wallet;
        }

        // Make a spin
        const spinRes = await request(app)
            .post('/slot/spin')
            .set('Authorization', `Bearer ${usrtoken}`)
            .send({ gid });

        expect(spinRes.status).toBe(200);
        expect(spinRes.body.sid).toBeGreaterThan(0);
        wallet = spinRes.body.wallet;

        // If there's a gain, try a doubleup
        const gain = spinRes.body.game.gain;
        if (gain > 0) {
            const doubleUpRes = await request(app)
                .post('/slot/doubleup')
                .set('Authorization', `Bearer ${usrtoken}`)
                .send({ gid, mult: 2, half: false });

            expect(doubleUpRes.status).toBe(200);
            wallet = doubleUpRes.body.wallet;
        }
    }, 10000); // Increase timeout for this test
});
