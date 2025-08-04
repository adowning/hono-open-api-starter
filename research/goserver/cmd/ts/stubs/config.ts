// Configuration variables
export const Cfg = {
    AppName: 'goserver-ts',
    BuildVers: '1.0.0',
    BuildTime: new Date().toISOString(),
    CfgFile: '',
    SqlPath: '',
    DevMode: false,
    DefMRTP: 95.0,
    MCCount: 0,
    MCPrec: 0,
    MTCount: 0,
    DriverName: 'sqlite3',
    ClubSourceName: ':memory:',
    SpinSourceName: '',
    UseSpinLog: false,
    TrustedProxies: [] as string[],
    PortHTTP: ['8080'],
    ReadTimeout: 5000,
    ReadHeaderTimeout: 2000,
    WriteTimeout: 5000,
    IdleTimeout: 30000,
    MaxHeaderBytes: 1 << 20,
    ShutdownTimeout: 5000,
    ClubUpdateBuffer: 100,
    ClubInsertBuffer: 100,
    SpinInsertBuffer: 100,
    SqlFlushTick: 1000,
};

// This function is a placeholder for the Go version's `initConfig`
export const InitConfig = () => {
    // In a real application, this would read from a config file (e.g., Cfg.CfgFile)
    // and populate the Cfg object. For now, we'll just log a message.
    console.log('Initializing configuration...');
};
