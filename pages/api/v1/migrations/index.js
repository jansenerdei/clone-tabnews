import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import migrator from "models/migrator";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:migrations"), getHandler);
router.post(controller.canRequest("create:migrations"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  const userTryingToGet = request.context.user;
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migrations",
    pendingMigrations,
  );

  return response.status(200).json(secureOutputValues);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();
  const userTryingToPost = request.context.user;
  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "create:migrations",
    migratedMigrations,
  );

  if (migratedMigrations.length > 0) {
    return response.status(201).json(secureOutputValues);
  }
  return response.status(200).json(secureOutputValues);
}
