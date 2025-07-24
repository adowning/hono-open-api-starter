import configureOpenAPI from "#/lib/configure-open-api";
import createApp from "#/lib/create-app";
import auth from "#/routes/auth/auth.router";
import index from "#/routes/index.route";
import redtiger from "#/routes/redtiger/redtiger.router";
import tasks from "#/routes/tasks/tasks.index";
import users from "#/routes/user/user.router";
import websocket from "#/routes/websocket/websocket.router"; // Import the new router

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  tasks,
  auth,
  users,
  redtiger,
  websocket,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
