import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError } from "infra/errors.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(req, res) {
  const userInputValue = req.body;

  try {
    const storedUser = await user.findOneByEmail(userInputValue.email);

    const correctPasswordMatch = await password.compare(
      userInputValue.password,
      storedUser.password,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se os dados estão corretos.",
      });
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Dados de autenticação não conferem.",
      action: "Verifique se os dados estão corretos.",
    });
  }
  return res.status(201).json({});
}
