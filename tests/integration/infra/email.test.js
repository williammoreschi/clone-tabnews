import email from "infra/email.js";

describe("infra/email", () => {
  test("send", async () => {
    await email.send({
      from: "Clone TabNews <contato@tabnews.com.br>",
      to: "test@tabnews.com.br",
      subject: "Teste assunto",
      text: "Teste de corpo do email",
    });
  });
});
