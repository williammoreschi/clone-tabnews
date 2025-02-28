import retry from "async-retry";

async function waitForAllServices() {
  await webForWebServicer();

  async function webForWebServicer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (error, attempt) => {
        console.log(
          `Attempt ${attempt} - Failed to fetch status page: ${error.message}`
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

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
