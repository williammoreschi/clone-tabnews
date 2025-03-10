import { createRouter } from "next-connect";
import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get((req, res) => handleMigration(req, res, true));
router.post((req, res) => handleMigration(req, res, false));

export default router.handler(controller.errorHandler);

async function handleMigration(req, res, dryRun) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOption = {
      dbClient,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
      dryRun,
    };

    const migrations = await migrationRunner(defaultMigrationOption);
    const statusCode = dryRun ? 200 : migrations.length > 0 ? 201 : 200;
    return res.status(statusCode).json(migrations);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient?.end();
  }
}
