import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";

async function waitForAllServices() {
  await webForWebServicer();

  async function webForWebServicer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (error, attempt) => {
        console.log(
          `Attempt ${attempt} - Failed to fetch status page: ${error.message}`,
        );
      },
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw new Error(`HTTP error ${response.status}`);
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username ?? faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email ?? faker.internet.email(),
    password: userObject.password ?? "password123",
  });
}

async function runPendingMigrations() {
  await migrator.runPendingMigration();
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
