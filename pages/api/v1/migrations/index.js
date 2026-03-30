import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";
import authorization from "models/authorization";
const router = createRouter();

router.use(controller.injectAnonymousOrUser);

router.get(controller.canRequest("read:migration"), getHandler);
router.post(controller.canRequest("create:migration"), postHandler);

export default router.handler(controller.errorHandler);

async function getHandler(req, res) {
  const userTryingToGet = req.context.user;
  const pendingMigrations = await migrator.listPendingMigration();

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    pendingMigrations,
  );

  return res.status(200).json(secureOutputValues);
}

async function postHandler(req, res) {
  const userTryingToGet = req.context.user;
  const migratedMigrations = await migrator.runPendingMigration();
  const statusCode = migratedMigrations.length > 0 ? 201 : 200;
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    migratedMigrations,
  );
  console.log("secureOutputValues", secureOutputValues);
  console.log("statusCode", statusCode);
  return res.status(statusCode).json(secureOutputValues);
}
