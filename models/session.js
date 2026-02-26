import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // Expira em 30 dias

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO 
          sessions (token, user_id, expires_at) 
        VALUES 
          ($1,$2,$3)
        RETURNING
          *
      `,
      values: [token, userId, expiresAt],
    });
    return results.rows[0];
  }
}

async function findOneValidByToken(sessionToken) {
  const result = await runSelectQuery(sessionToken);
  return result;

  async function runSelectQuery(sessionToken) {
    const results = await database.query({
      text: `
        SELECT * FROM sessions
        WHERE token = $1
        AND expires_at > NOW()
        LIMIT 1
      `,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa",
        action: "Verifique se o usuário está logado e tente novamente",
      });
    }

    return results.rows[0];
  }
}

async function renew(sessionId) {
  const newExpireAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const renewSessionObject = await runUpdateQuery(sessionId, newExpireAt);

  async function runUpdateQuery(sessionId, newExpireAt) {
    const result = await database.query({
      text: `
        UPDATE sessions
        SET expires_at = $1, updated_at = NOW()
        WHERE id = $2
        Returning *
      `,
      values: [newExpireAt, sessionId],
    });
    return result.rows[0];
  }
  return renewSessionObject;
}

async function expireById(sessionId) {
  const expiredSessionObject = await runUpdateQuery(sessionId);

  async function runUpdateQuery(sessionId) {
    const result = await database.query({
      text: `
        UPDATE sessions
        SET expires_at = expires_at - INTERVAL '1 year', 
        updated_at = NOW()
        WHERE id = $1
        Returning *
      `,
      values: [sessionId],
    });
    return result.rows[0];
  }
  return expiredSessionObject;
}

const session = {
  create,
  findOneValidByToken,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
