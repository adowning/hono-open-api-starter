import type { Server } from "bun";

import { and, eq } from "drizzle-orm";
import * as jose from "jose";

import app from "./app";
import db from "./db";
import { AuthSession, User } from "./db/schema";
import env from "./env";
import { websocketHandler } from "./routes/websocket/websocket.handler";

const port = env.PORT;

console.log(`Server is running on http://localhost:${port}`);

// Assign the server instance to a constant
const server: Server = Bun.serve({
  port,
  async fetch(req, server) {
    const url = new URL(req.url);
    const match = /^\/ws\/(?<topic>\w+)$/.exec(url.pathname);
    if (match) {
      const topic = match.groups?.topic as keyof typeof websocketHandler;
      const token = new URL(req.url).searchParams.get("token");
      if (!token) {
        return new Response("Unauthorized", { status: 401 });
      }
      try {
        const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        if (!payload.userId || !payload.sessionId) {
          return new Response("Invalid token", { status: 401 });
        }
        const authSession = await db.query.AuthSession.findFirst({
          where: and(
            eq(AuthSession.id, payload.sessionId as string),
            eq(AuthSession.status, "ACTIVE"),
          ),
        });
        if (!authSession) {
          return new Response("Session not found or has expired", { status: 401 });
        }
        const user = await db.query.User.findFirst({
          where: eq(User.id, payload.userId as string),
        });
        if (!user) {
          return new Response("User not found", { status: 401 });
        }
        if (server.upgrade(req, { data: { user, authSession, topic } })) {
          return;
        }
      }
      catch (error: any) {
        return new Response(error.message, { status: 401 });
      }
    }
    return app.fetch(req, server);
  },
  websocket: websocketHandler,
  error() {
    return new Response("Uh oh!!", { status: 500 });
  },
});

// Export the server instance
export { server };
