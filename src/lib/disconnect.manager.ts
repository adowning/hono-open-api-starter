// src/lib/graceful-disconnect.manager.ts
import chalk from "chalk";

import { SessionManager } from "./session.manager";

// This will store active timers, mapping a userId to their timeout ID
const disconnectTimers = new Map<string, NodeJS.Timeout>();

// The duration of the grace period in milliseconds (e.g., 60 seconds)
const GRACE_PERIOD_MS = 60 * 1000;

export class GracefulDisconnectManager {
  /**
   * Starts a timer to end the user's session after the grace period.
   * @param userId - The ID of the user who disconnected.
   */
  static start(userId: string): void {
    // If a timer already exists for this user, clear it before starting a new one.
    if (disconnectTimers.has(userId)) {
      this.cancel(userId);
    }

    console.log(chalk.yellow(`WebSocket disconnected for user ${userId}. Starting ${GRACE_PERIOD_MS / 1000}s grace period timer.`));

    const timer = setTimeout(() => {
      console.log(chalk.red(`Grace period expired for user ${userId}. Ending game session.`));
      SessionManager.endCurrentGameSession(userId);
      disconnectTimers.delete(userId);
    }, GRACE_PERIOD_MS);

    disconnectTimers.set(userId, timer);
  }

  /**
   * Cancels the disconnect timer for a user, typically because they have reconnected.
   * @param userId - The ID of the user who reconnected.
   */
  static cancel(userId: string): void {
    if (disconnectTimers.has(userId)) {
      console.log(chalk.green(`User ${userId} reconnected within the grace period. Cancelling session termination.`));
      clearTimeout(disconnectTimers.get(userId));
      disconnectTimers.delete(userId);
    }
  }
}
