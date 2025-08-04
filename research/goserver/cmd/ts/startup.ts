import { Cfg } from './stubs/config';
import * as api from './stubs/api';

// This is a simplified AbortController-like implementation for graceful shutdown signaling.
// In a real Node.js app, you might use AbortController or a similar pattern.
const shutdownListeners: (() => void)[] = [];

function setupSignalHandlers() {
    const handleShutdown = () => {
        console.log('\nShutting down gracefully...');
        for (const listener of shutdownListeners) {
            listener();
        }
        // Give listeners a moment to clean up before forcing exit.
        setTimeout(() => process.exit(0), 500);
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
}

// The context object to be passed around, containing the shutdown signal.
export interface AppContext {
    shutdown: (callback: () => void) => void;
    isShutdown: () => boolean;
}

let shutdownInitiated = false;

// This function sets up the application's graceful shutdown mechanism.
export const Startup = (): AppContext => {
    setupSignalHandlers();

    const context: AppContext = {
        shutdown: (callback: () => void) => {
            shutdownListeners.push(callback);
        },
        isShutdown: () => shutdownInitiated,
    };

    shutdownListeners.push(() => {
        shutdownInitiated = true;
    });

    return context;
};

// Stub for initializing storage.
export const Init = async (): Promise<void> => {
    console.log('Initializing storage...');
    if (Cfg.ClubSourceName !== ':memory:') {
        console.log(`club db: ${Cfg.DriverName}`);
    } else {
        console.log('club db: memory');
    }
    if (Cfg.UseSpinLog) {
        if (Cfg.SpinSourceName !== ':memory:') {
            console.log(`spin db: ${Cfg.DriverName}`);
        } else {
            console.log('spin db: memory');
        }
    }
    console.log('Storage initialized.');
    return Promise.resolve();
};

// Stub for cleaning up resources on shutdown.
export const Done = async (): Promise<void> => {
    console.log('Flushing buffers and cleaning up resources...');
    // Simulate flushing various buffers
    await api.JoinBuf.Flush({}, 0);
    if (Cfg.UseSpinLog) {
        await api.SpinBuf.Flush({}, 0);
        await api.MultBuf.Flush({}, 0);
    }
    console.log('Resources cleaned up.');
    return Promise.resolve();
};

// Stub for the continuous SQL data flushing loop.
export const SqlLoop = (context: AppContext) => {
    console.log('Starting SQL loop...');
    const interval = setInterval(() => {
        if (context.isShutdown()) {
            clearInterval(interval);
            console.log('SQL loop stopped.');
            return;
        }
        console.log('SQL loop: flushing buffers...');
        // In a real implementation, you would call the flush methods here.
        // e.g., Promise.all(Object.values(api.BankBat).map(b => b.Flush({}, Cfg.SqlFlushTick)))
    }, Cfg.SqlFlushTick);
};
