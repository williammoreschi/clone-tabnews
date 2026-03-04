import webserver from "infra/scripts/webserver";
import activation from "models/activation";
import user from "models/user";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createUserResponseBody;
  let activationTokenId;

  test("Create user account", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "registrationFlowTest",
        email: "registrationflowtest@gmail.com",
        password: "123456",
      }),
    });

    expect(response.status).toBe(201);

    createUserResponseBody = await response.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "registrationFlowTest",
      email: "registrationflowtest@gmail.com",
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@tabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registrationflowtest@gmail.com>");
    expect(lastEmail.subject).toBe("Ative sua conta no Clone Tabnews");
    expect(lastEmail.text).toContain("registrationFlowTest");

    activationTokenId = orchestrator.extractUUID(lastEmail.text);
    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
    );

    const activeTokenObject =
      await activation.findOneValidById(activationTokenId);
    expect(activeTokenObject.user_id).toBe(createUserResponseBody.id);
    expect(activeTokenObject.used_at).toBe(null);
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `${webserver.origin}/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();
    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("registrationFlowTest");
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Login", async () => {});

  test("Get user information", async () => {});
});
