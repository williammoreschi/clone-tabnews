import password from "models/password";
import user from "models/user";
import { NotFoundError, UnauthorizedError } from "infra/errors";

async function getAuthenticateUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail, providedPassword);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados estão corretos.",
      });
    }
    throw error;
  }

  async function findUserByEmail(providedEmail) {
    try {
      return await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se os dados estão corretos.",
        });
      }

      throw error;
    }
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se os dados estão corretos.",
      });
    }
  }
}

const authentication = {
  getAuthenticateUser,
};

export default authentication;
