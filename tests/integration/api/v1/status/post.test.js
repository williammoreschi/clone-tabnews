import orchestrator from "tests/orchestrator";
import webserver from "infra/scripts/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous `user`", () => {
    test("`Running` current `system status`", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        method: "POST",
      });
      expect(response.status).toBe(405);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint.",
        action: "Verifique se o método HTTP utilizado está correto.",
        status_code: 405,
      });
    });
  });
});
