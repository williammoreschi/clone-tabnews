import database from "infra/database";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputValue) {
  validatePresenceOfFields(userInputValue);
  validateEmailFormat(userInputValue.email);
  await validateUniqueUsername(userInputValue.username);
  await validateUniqueEmail(userInputValue.email);
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

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

async function update(username, userInputValue) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValue) {
    if (
      currentUser.username.toLowerCase() !==
      userInputValue.username.toLowerCase()
    ) {
      await validateUniqueUsername(userInputValue.username);
    }
  }

  if ("email" in userInputValue) {
    console.log(
      currentUser.email.toLowerCase(),
      " == ",
      userInputValue.email.toLowerCase(),
    );
    if (
      currentUser.email.toLowerCase() !== userInputValue.email.toLowerCase()
    ) {
      await validateUniqueEmail(userInputValue.email);
    }
  }

  if ("password" in userInputValue) {
    await hashPasswordInObject(userInputValue);
  }

  const userWithNewValues = { ...currentUser, ...userInputValue };

  const updateUser = await runUpdateQuery(userWithNewValues);
  return updateUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `
        UPDATE users
        SET username = $2, email = $3, password = $4, updated_at = timezone('UTC', now())
        WHERE id = $1
        RETURNING *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function validateUniqueUsername(username) {
  const results = await database.query({
    text: `
      SELECT email, username FROM users 
      WHERE LOWER(username) = LOWER($1)
    `,
    values: [username.trim()],
  });

  if (results.rowCount > 0) {
    const existingUser = results.rows[0];
    if (existingUser.username.toLowerCase() === username.trim().toLowerCase()) {
      throw new ValidationError({
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
      });
    }
  }
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `
      SELECT email, username FROM users 
      WHERE LOWER(email) = LOWER($1)
    `,
    values: [email.trim()],
  });

  if (results.rowCount > 0) {
    const existingUser = results.rows[0];
    if (existingUser.email.toLowerCase() === email.trim().toLowerCase()) {
      throw new ValidationError({
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
      });
    }
  }
}

async function hashPasswordInObject(userInputValue) {
  const hashedPassword = await password.hash(userInputValue.password);
  userInputValue.password = hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
