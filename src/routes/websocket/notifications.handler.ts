import type { ServerWebSocket } from "bun";
import type { Buffer } from "node:buffer";

import type { WebSocketData } from "./websocket.handler";

export const notificationsHandler = {
  open(ws: ServerWebSocket<WebSocketData>) {
    const { user } = ws.data;
    const userTopic = `notifications-${user.id}`;
    ws.subscribe(userTopic);
    console.log(`User ${user.username} subscribed to notifications`);
    ws.send("You are now subscribed to notifications.");
  },

  message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    // This could be used for client-side acknowledgements, for example
    console.log("Received notification interaction:", message);
  },

  close(ws: ServerWebSocket<WebSocketData>) {
    const { user } = ws.data;
    const userTopic = `notifications-${user.id}`;
    ws.unsubscribe(userTopic);
    console.log(`User ${user.username} unsubscribed from notifications`);
  },
};
