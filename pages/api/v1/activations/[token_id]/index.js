import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandler);

async function patchHandler(req, res) {
  const activationTokenId = req.query.token_id;

  const validActivationToken = await activation.findOneValidById(activationTokenId);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const userActivationToken = await activation.markTokenAsUsed(activationTokenId);
    
  return res.status(200).json(userActivationToken);
}
