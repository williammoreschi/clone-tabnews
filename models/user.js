import database from "infra/database";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputValue) {
  validatePresenceOfFields(userInputValue);
  validateEmailFormat(userInputValue.email);
  await validateUniqueFields(userInputValue);
  await hashPasswordInObject(userInputValue);

  const newUser = await runInsertQuery(userInputValue);
  return newUser;

  function validatePresenceOfFields({ email, username }) {
    if (!email || !email.trim()) {
      throw new ValidationError({
        message: "O campo email é obrigatório.",
        action: "Informe um email válido.",
      });
    }

    if (!username || !username.trim()) {
      throw new ValidationError({
        message: "O campo username é obrigatório.",
        action: "Informe um username válido.",
      });
    }
  }

  function validateEmailFormat(email) {
    if (!isValidEmail(email)) {
      throw new ValidationError({
        message: "O email informado não é válido.",
        action: "Informe um email válido.",
      });
    }
  }

  async function validateUniqueFields({ email, username }) {
    const results = await database.query({
      text: `
        SELECT email, username FROM users 
        WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)
      `,
      values: [email.trim(), username.trim()],
    });

    if (results.rowCount > 0) {
      const existingUser = results.rows[0];
      if (existingUser.email.toLowerCase() === email.trim().toLowerCase()) {
        throw new ValidationError({
          message: "O email informado já está sendo utilizado.",
          action: "Utilize outro email para realizar o cadastro.",
        });
      }
      if (
        existingUser.username.toLowerCase() === username.trim().toLowerCase()
      ) {
        throw new ValidationError({
          message: "O username informado já está sendo utilizado.",
          action: "Utilize outro username para realizar o cadastro.",
        });
      }
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function hashPasswordInObject(userInputValue) {
    const hashedPassword = await password.hash(userInputValue.password);
    userInputValue.password = hashedPassword;
  }

  async function runInsertQuery(userInputValue) {
    const results = await database.query({
      text: `
        INSERT INTO 
          users (username,email,password) 
        VALUES 
          ($1,$2,$3)
        RETURNING
          *
      `,
      values: [
        userInputValue.username,
        userInputValue.email,
        userInputValue.password,
      ],
    });

    return results.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT * FROM users
        WHERE LOWER(username) = LOWER($1)
        LIMIT 1
      `,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se username está digitado corretamente.",
      });
    }

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
