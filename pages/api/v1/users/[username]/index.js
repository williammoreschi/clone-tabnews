import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/errors";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);

router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandler);

async function getHandler(req, res) {
  const userTryingToGet = req.context.user;
  const { username } = req.query;
  const userFind = await user.findOneByUsername(username);
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    userFind,
  );
  return res.status(200).json(secureOutputValues);
}

async function patchHandler(req, res) {
  const { username } = req.query;
  const userInputValue = req.body;

  const userTryingToPatch = req.context.user;

  const targetUser = await user.findOneByUsername(username);

  if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não tem permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessária para atualizar outro usuário.",
    });
  }

  const updateUser = await user.update(username, userInputValue);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:user",
    updateUser,
  );

  return res.status(200).json(secureOutputValues);
}
