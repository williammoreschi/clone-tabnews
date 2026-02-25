import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";
const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandler);

async function getHandler(req, res) {
  const migrations = await migrator.listPendingMigration();
  return res.status(200).json(migrations);
}

async function postHandler(req, res) {
  const migratedMigrations = await migrator.runPendingMigration();
  const statusCode = migratedMigrations.length > 0 ? 201 : 200;
  return res.status(statusCode).json(migratedMigrations);
}
