import { randomUUID } from "crypto";

// --- CONFIGURATION ---
// Set the desired starting balance for the user in cents (e.g., 50000 = $500.00)
const INITIAL_WALLET_BALANCE_CENTS = 50000;
// --- END CONFIGURATION ---

// Function to perform a fetch request with a timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

async function runBot() {
  const baseUrl = "http://localhost:9999";
  let accessToken = "";
  let user: any = null;
  let gameSessionToken = ""; // Variable to store the session-specific token
  let gameUserId: any = null; // To store the user ID from the settings response
  let gameFingerprint: any = null; // To store the fingerprint from the settings response

  try {
    // 1. Login to get the initial access token
    console.log("Attempting to log in...");
    const loginResponse = await fetchWithTimeout(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "asdf", password: "asdfasdf" }),
    });

    if (!loginResponse.ok) {
      console.error(`Login failed: ${loginResponse.status}`);
      return;
    }

    const loginData = await loginResponse.json();
    accessToken = loginData.accessToken;
    user = loginData.user;
    console.log("Login successful.");

    // 2. Set the initial wallet balance
    console.log(`\nSetting initial wallet balance to $${(INITIAL_WALLET_BALANCE_CENTS / 100).toFixed(2)}...`);
    await fetchWithTimeout(`${baseUrl}/wallet/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify({ amount: INITIAL_WALLET_BALANCE_CENTS, type: 'credit', description: 'Bot Initial Balance' }),
    });


    // 3. Establish WebSocket connections
    console.log("\nConnecting to WebSockets...");
    const userWs = new WebSocket(`${baseUrl.replace('http', 'ws')}/ws/user?token=${accessToken}`);
    const notificationsWs = new WebSocket(`${baseUrl.replace('http', 'ws')}/ws/notifications?token=${accessToken}`);

    userWs.onopen = () => console.log("🟢 User WebSocket connected.");
    notificationsWs.onopen = () => console.log("🟢 Notifications WebSocket connected.");
    userWs.onmessage = (event) => console.log("🔵 [USER UPDATE]:", event.data);
    notificationsWs.onmessage = (event) => console.log("🔔 [NOTIFICATION]:", event.data);
    userWs.onerror = (err) => console.error("🔴 User WebSocket error:", err);
    notificationsWs.onerror = (err) => console.error("🔴 Notifications WebSocket error:", err);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Get Game Settings to initialize the session and get critical data
    console.log("\nAttempting to get game settings...");
    const initialFingerprint = randomUUID();
    const settingsPayload = {
        gameId: "Atlantis",
        token: null,
        userId: user.id,
        currency: "USD",
        sessionId: "0", 
        mode: "demo",
        language: "en",
        userData: {
            userId: user.id,
            fingerprint: initialFingerprint,
        },
        custom: {
  "siteId": "",
  "extras": ""
}
    };

    const settingsResponse = await fetchWithTimeout(`${baseUrl}/redtiger/game/settings`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(settingsPayload),
    });

    const settingsData = await settingsResponse.json();
    if (!settingsResponse.ok || !settingsData.success) {
      console.error(`Failed to get game settings with status: ${settingsResponse.status}.`);
      console.error("Response:", settingsData);
      return;
    }
    
    // **CRITICAL STEP:** Capture session data from the settings response
    gameSessionToken = settingsData.result.user.token;
    gameUserId = settingsData.result.user.userId;
    gameFingerprint = settingsData.result.user.fingerprint || initialFingerprint; 
    console.log("Game settings received successfully. Using new game session data.");


    // 5. Perform spins using the data from the settings response
    for (let i = 1; i <= 5; i++) {
      console.log(`\n--- Performing Spin #${i} ---`);

      // Construct the detailed spin payload
      const spinPayload = {
          token: gameSessionToken,
          sessionId: "0",
          playMode: "demo",
          gameId: "Atlantis",
          userData: {
              userId: gameUserId,
              affiliate: "",
              lang: "en",
              channel: "I",
              userType: "U",
              fingerprint: gameFingerprint,
          },
          custom: {
              siteId: "",
              extras: ""
          },
          stake: 1.00,
          bonusId: null,
          extras: null,
          gameMode: 0
      };
      
      const spinResponse = await fetchWithTimeout(`${baseUrl}/redtiger/game/spin`, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
          },
          body: JSON.stringify(spinPayload),
      });

      const spinData = await spinResponse.json();

      if (!spinResponse.ok || !spinData.success) {
          console.error(`Spin #${i} failed with status: ${spinResponse.status}.`);
          console.error("Response:", spinData);
      } else {
        console.log(`Spin #${i} successful. Win: $${spinData.result.game.win.total}`);
        // **CRITICAL STEP:** Update the token and fingerprint for the next spin
        gameSessionToken = spinData.result.user.token;
        gameFingerprint = spinData.result.user.fingerprint || gameFingerprint;
      }

      if (i < 5) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

  } catch (err) {
    console.error("An error occurred during the bot execution:", err);
  } finally {
    console.log("\nBot has finished its tasks.");
    process.exit(0);
  }
}

runBot();