import { program } from './root';
import express from 'express';
import * as http from 'http';
import { Cfg } from './stubs/config';
import * as startup from './startup';
import * as api from './stubs/api';

const webCmd = program.command('web')
    .description('Starts web-server')
    .action(async () => {
        if (Cfg.DevMode) {
            console.log('Running in development mode.');
            // In a real app, you might use 'morgan' for logging, etc.
        }

        const appContext = startup.Startup();

        try {
            await startup.Init();
        } catch (err) {
            console.error('Failed to initialize application:', err);
            process.exit(1);
        }

        startup.SqlLoop(appContext);

        const app = express();
        app.set('trust proxy', Cfg.TrustedProxies);
        api.SetupRouter(app); // Setup routes from the stub

        const servers: http.Server[] = [];

        // Graceful shutdown handler
        appContext.shutdown(async () => {
            console.log('Shutting down web servers...');
            const shutdownPromises = servers.map(server =>
                new Promise<void>(resolve => server.close(() => resolve()))
            );

            await Promise.all(shutdownPromises);
            console.log('All web servers closed.');

            await startup.Done();
        });

        // Start listening on all configured ports
        for (const portStr of Cfg.PortHTTP) {
            const port = parseInt(portStr, 10);
            if (isNaN(port)) {
                console.error(`Invalid port specified: ${portStr}`);
                continue;
            }

            const server = app.listen(port, () => {
                console.log(`start http on port ${port}`);
            }).on('error', (err) => {
                console.error(`Failed to start server on port ${port}:`, err);
            });
            servers.push(server);
        }
    });

webCmd.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log(`  $ ${Cfg.AppName} web`);
});
