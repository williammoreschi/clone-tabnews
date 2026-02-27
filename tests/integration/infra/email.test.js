import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmail();
});

describe("infra/email", () => {
  test("send", async () => {
    await email.send({
      from: "Clone TabNews <contato@tabnews.com.br>",
      to: "test@tabnews.com.br",
      subject: "Teste assunto",
      text: "Teste de corpo do email",
    });

    await email.send({
      from: "Clone TabNews <contato@tabnews.com.br>",
      to: "test@tabnews.com.br",
      subject: "Ultimo email",
      text: "Teste de corpo do ultimo email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@tabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<test@tabnews.com.br>");
    expect(lastEmail.subject).toBe("Ultimo email");
    expect(lastEmail.text.trim()).toBe("Teste de corpo do ultimo email.");
  });
});
