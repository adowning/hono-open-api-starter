import type { ServerWebSocket } from "bun";

import type { WebSocketData } from "./websocket.handler";

export const userHandler = {
  open(ws: ServerWebSocket<WebSocketData>) {
    const { user } = ws.data;
    // Subscribe to a private, user-specific topic
    const userTopic = `user-${user.id}`;
    ws.subscribe(userTopic);
    console.log(`User ${user.username} subscribed to private updates on topic ${userTopic}`);
    ws.send("You are now subscribed to private user updates.");
  },

  message() {
    // This channel is primarily for server-to-client pushes, so we can ignore client messages.
  },

  close(ws: ServerWebSocket<WebSocketData>) {
    const { user } = ws.data;
    const userTopic = `user-${user.id}`;
    ws.unsubscribe(userTopic);
    console.log(`User ${user.username} unsubscribed from private updates.`);
  },
};
