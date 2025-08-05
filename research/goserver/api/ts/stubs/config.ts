// This is a stub for the config package.
// In a real application, this would be loaded from a file or environment variables.

export const Cfg = {
    BuildVers: "1.0.0-ts",
    BuildTime: new Date().toISOString(),
    AccessKey: "access-secret-key",
    RefreshKey: "refresh-secret-key",
    AccessTTL: "15m",
    RefreshTTL: "7d",
    CodeTimeout: "5m",
    NonceTimeout: "10s",
    UseActivation: false,
    BrevoEmailEndpoint: "https://api.brevo.com/v3/smtp/email",
    BrevoApiKey: "your-brevo-api-key",
    SenderName: "Slotopol",
    SenderEmail: "noreply@slotopol.com",
    ReplytoEmail: "reply@slotopol.com",
    EmailSubject: "Your verification code",
    EmailHtmlContent: "Your verification code is: %d",
    ClubInsertBuffer: 1,
    ClubUpdateBuffer: 1,
    MaxSpinAttempts: 10,
    MinJackpot: 1,
    DefMRTP: 95.0,
    AdjunctLimit: 100000,
    UseSpinLog: false,
    XormStorage: null, // This will be a mock/stub database connection
    XormSpinlog: null, // This will be a mock/stub database connection
};
