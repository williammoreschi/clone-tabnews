import dedent from "dedent";
import email from "infra/email";

async function sendEmailToUser(user) {
  await email.send({
    from: "Clone TabNews <contato@tabnews.com.br>",
    to: user.email,
    subject: "Ative sua conta no Clone Tabnews",
    text: dedent(`Olá ${user.username}, para ativar sua conta, clique no link abaixo:
    https://.../activate/token
    Atenciosamente
    Equipe Clone TabNews`),
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
