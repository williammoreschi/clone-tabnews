import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("Use case: Registration Flow (all successful)", () => {
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

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "registrationFlowTest",
      email: "registrationflowtest@gmail.com",
      features: ["read:activation_token"],
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@tabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registrationflowtest@gmail.com>");
    expect(lastEmail.subject).toBe("Ative sua conta no Clone Tabnews");
    expect(lastEmail.text).toContain("registrationFlowTest");
  });

  test("Activate account", async () => {});

  test("Login", async () => {});

  test("Get user information", async () => {});
});
