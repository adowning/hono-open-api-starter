async function runBot() {
  const baseUrl = "http://localhost:9999";
  let sessionCookie = "";

  // Function to perform a fetch request with a timeout
  async function fetchWithTimeout(url: string, options: RequestInit, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      // If the error is an AbortError, we can throw a custom timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      // Otherwise, re-throw the original error
      throw error;
    } finally {
      clearTimeout(id);
    }
  }

  try {
    // 1. Login to get the session cookie
    console.log("Attempting to log in...");
    const loginResponse = await fetchWithTimeout(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "asdf", password: "asdfasdf" }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error(`Login failed with status: ${loginResponse.status}. Response: ${errorText}`);
      return; // Exit if login fails
    }

    const setCookieHeader = loginResponse.headers.get("set-cookie");
    if (!setCookieHeader) {
      console.error("Login response did not include a set-cookie header.");
      return; // Exit if no cookie
    }
    sessionCookie = setCookieHeader.split(";")[0];
    console.log("Login successful. Received session cookie:", sessionCookie);

    // 2. Make a request to the game settings endpoint
    console.log("\nAttempting to get game settings...");
    const settingsResponse = await fetchWithTimeout(`${baseUrl}/redtiger/game/settings`, {
      method: "POST",
      headers: { "Cookie": sessionCookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: "Atlantis",
        userId: "asdf",
        currency: "USD",
        mode: "real",
        language: "en",
        gameSessionId: "null",
        gameName: "Atlantis",
      }),
    });

    const settingsData = await settingsResponse.json();

    if (!settingsResponse.ok) {
      console.error(`Failed to get game settings with status: ${settingsResponse.status}.`);
      console.error("Response:", settingsData);
      return; // Exit if settings fail
    }
    console.log("Game settings response success: true");


    // 3. Perform 3 spins with a 1-second delay
    for (let i = 1; i <= 3; i++) {
      console.log(`\nAttempting to perform spin #${i}...`);
      const spinResponse = await fetchWithTimeout(`${baseUrl}/redtiger/game/spin`, {
          method: "POST",
          headers: {
              "Cookie": sessionCookie,
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              token: "some-token",
              userId: "asdf",
              gameId: "Atlantis",
              stake: "1.00",
              currency: "USD",
              sessionId: "null",
              gameName: "Atlantis",
              gameSessionId: "null",
          }),
      });

      const spinData = await spinResponse.json();

      if (!spinResponse.ok) {
          console.error(`Failed to perform spin #${i} with status: ${spinResponse.status}.`);
          console.error("Response:", spinData);
          // Continue to the next spin even if this one fails
      } else {
        console.log(`Spin #${i} successful.`);
      }

      // Wait for 1 second before the next spin
      if (i < 3) {
        console.log("Waiting 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (err) {
    console.error("An error occurred during the bot execution:", err);
  } finally {
    console.log("\nBot has finished its tasks.");
  }
}

runBot();
