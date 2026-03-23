import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique 'username'", async () => {
      const userUnique = await orchestrator.createUser({
        username: "userunique",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userUnique.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "userunique2",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: 'Verifique se o seu usuário possui a feature "update:user"',
        message: "Você não possui permissão para executar esta ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With nonexistent 'username'", async () => {
      const createUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createUser.id);
      const sessionObjetct = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioNaoExiste",
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${sessionObjetct.token}`,
          },
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      const createUser2 = await orchestrator.createUser({
        username: "user2",
      });
      const activatedUser2 = await orchestrator.activateUser(createUser2.id);
      const sessionObjetct2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObjetct2.token}`,
        },
        body: JSON.stringify({
          username: "useR1",
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: "Utilize outro username para realizar esta operação.",
        message: "O username informado já está sendo utilizado.",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With `user2` targeting `user1`", async () => {
      const createUser1 = await orchestrator.createUser({});

      const createUser2 = await orchestrator.createUser({});
      const activatedUser2 = await orchestrator.activateUser(createUser2.id);
      const sessionObjetct2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObjetct2.token}`,
          },
          body: JSON.stringify({
            username: "user3",
          }),
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action:
          "Verifique se você possui a feature necessária para atualizar outro usuário.",
        message: "Você não tem permissão para atualizar outro usuário.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "useremail1@gmail.com",
      });

      const createUser2 = await orchestrator.createUser({
        email: "useremail2@gmail.com",
      });
      const activatedUser2 = await orchestrator.activateUser(createUser2.id);
      const sessionObjetct2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObjetct2.token}`,
          },
          body: JSON.stringify({
            email: "useremail1@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createUser = await orchestrator.createUser({
        username: "useruniqueX",
      });
      const activated = await orchestrator.activateUser(createUser.id);
      const sessionObjetct = await orchestrator.createSession(activated.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObjetct.token}`,
          },
          body: JSON.stringify({
            username: "useruniqueY",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "useruniqueY",
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.updated_at).toBeDefined();
    });

    test("With unique 'email'", async () => {
      const createUser = await orchestrator.createUser({
        email: "emailunique1@gmail.com",
      });
      const activatedUser = await orchestrator.activateUser(createUser.id);
      const sessionObjetct = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObjetct.token}`,
          },
          body: JSON.stringify({
            email: "emailunique2@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.updated_at).toBeDefined();
    });

    test("With new 'password'", async () => {
      const createUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createUser.id);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "123abc567",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.updated_at).toBeDefined();

      const userFromDb = await user.findOneByUsername(createUser.username);

      const correctPasswordMath = await password.compare(
        "123abc567",
        userFromDb.password,
      );

      const incorrectPasswordMath = await password.compare(
        "123abc",
        userFromDb.password,
      );

      expect(correctPasswordMath).toBe(true);
      expect(incorrectPasswordMath).toBe(false);
    });
  });

  describe("Privelaged user", () => {
    test("With `update:user:others` targeting `defaultUser`", async () => {
      const defaultUser = await orchestrator.createUser();

      const privelagedUser = await orchestrator.createUser();
      const activatedPrivelagedUser = await orchestrator.activateUser(
        privelagedUser.id,
      );
      await orchestrator.addFeatureToUser(activatedPrivelagedUser, [
        "update:user:others",
      ]);
      const sessionObjetctPrivalgedUser = await orchestrator.createSession(
        activatedPrivelagedUser.id,
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObjetctPrivalgedUser.token}`,
          },
          body: JSON.stringify({
            username: "defaultUserUpdated",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: defaultUser.id,
        username: "defaultUserUpdated",
        features: defaultUser.features,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
