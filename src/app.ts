import configureOpenAPI from "#/lib/configure-open-api";
import createApp from "#/lib/create-app";
import auth from "#/routes/auth/auth.router";
import index from "#/routes/index.route";
import redtiger from "#/routes/redtiger/redtiger.router";
import users from "#/routes/user/user.router";
import vip from "#/routes/vip/vip.router"; // Import the new router
import wallet from "#/routes/wallet/wallet.router"; // Import the new router
import websocket from "#/routes/websocket/websocket.router"; // Import the new router

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  auth,
  users,
  redtiger,
  websocket,
  wallet,
  vip,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
