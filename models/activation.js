import dedent from "dedent";
import database from "infra/database";
import email from "infra/email";
import { NotFoundError } from "infra/errors";
import webserver from "infra/scripts/webserver";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // Expira em 15 minutos

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO 
          user_activation_tokens (user_id, expires_at) 
        VALUES 
          ($1, $2)
        RETURNING
          *
      `,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function findOneValidById(tokenId) {
  const activationTokenObject = await runSelectQuery(tokenId);
  return activationTokenObject;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1 
          AND used_at IS NULL
          AND expires_at > NOW()
        LIMIT 1
      `,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Token de ativação inválido ou expirado.",
        action: "Faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Clone TabNews <contato@tabnews.com.br>",
    to: user.email,
    subject: "Ative sua conta no Clone Tabnews",
    text: dedent(`Olá ${user.username}, para ativar sua conta, clique no link abaixo:
    ${webserver.origin}/cadastro/ativar/${activationToken.id}
    Atenciosamente
    Equipe Clone TabNews`),
  });
}

const activation = {
  create,
  sendEmailToUser,
  findOneValidById,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
