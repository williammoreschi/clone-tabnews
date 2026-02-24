import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "userWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      );
      expect(renewedSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      );

      // Set Cookie Session renewal assertions
      const parsedSetCookies = setCookieParser(response, { map: true });

      expect(parsedSetCookies.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With valid session created halfway to expiration", async () => {
      // Go back a few days
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS / 2),
      });

      const createdUser = await orchestrator.createUser({
        username: "userWithOldSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers(); // Go back to present time

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      // Session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      );
      expect(renewedSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      );
    });

    test("With nonexistent session", async () => {
      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=533d4a60aaee414eb93cc050e537dff6108017f138d0f65f61a86d84ab9f13f5a4e07270e689c8ad4c316915935eadcb`,
        },
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa",
        action: "Verifique se o usuário está logado e tente novamente",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "userWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa",
        action: "Verifique se o usuário está logado e tente novamente",
        status_code: 401,
      });
    });
  });
});
