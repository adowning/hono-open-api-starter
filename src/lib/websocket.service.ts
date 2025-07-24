import { server } from "#/index";

interface NotificationPayload {
  title: string;
  message: string;
  timestamp: string;
}

/**
 * Sends a real-time notification to a specific user.
 * @param userId - The ID of the user to notify.
 * @param payload - The notification content.
 */
export function sendNotificationToUser(userId: string, payload: Omit<NotificationPayload, "timestamp">) {
  if (!server) {
    console.error("WebSocket server is not available.");
    return;
  }

  const topic = `notifications-${userId}`;
  const message: NotificationPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  // Bun's publish method returns the number of subscribers the message was sent to.
  const subscriberCount = server.publish(topic, JSON.stringify(message));
  console.log(`Sent notification to ${subscriberCount} client(s) on topic ${topic}`);
}
