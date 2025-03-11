import { resolve } from "node:path";
import database from "infra/database";
import migrationRunner from "node-pg-migrate";

const defaultMigrationOption = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
  dryRun: true,
};

async function executeMigration(options) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const migrations = await migrationRunner({
      ...defaultMigrationOption,
      ...options,
      dbClient,
    });
    return migrations;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient?.end();
  }
}

async function listPendingMigration() {
  return executeMigration({});
}

async function runPendingMigration() {
  return executeMigration({ dryRun: false });
}

const migrator = {
  listPendingMigration,
  runPendingMigration,
};

export default migrator;
