import { createRouter } from "#/lib/create-app";
import { authMiddleware } from "#/middlewares/auth.middleware";

import * as controller from "./wallet.controller";

const router = createRouter();

// All wallet routes should be protected
router.use("*", authMiddleware);

router.post("/balance", controller.handleUpdateBalance);

export default router;
