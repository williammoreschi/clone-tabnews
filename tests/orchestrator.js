import retry from "async-retry";
import database from "infra/database";

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

const orchestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orchestrator;
