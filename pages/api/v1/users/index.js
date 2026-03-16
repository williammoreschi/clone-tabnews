import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import activation from "models/activation";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(req, res) {
  const userInputValue = req.body;
  const newUser = await user.create(userInputValue);

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken);

  return res.status(201).json(newUser);
}
