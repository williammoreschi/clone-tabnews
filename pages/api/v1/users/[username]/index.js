import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandler);

async function getHandler(req, res) {
  const { username } = req.query;
  const userFind = await user.findOneByUsername(username);
  return res.status(200).json(userFind);
}
async function patchHandler(req, res) {
  const { username } = req.query;
  const userInputValue = req.body;
  const updateUser = await user.update(username, userInputValue);
  return res.status(200).json(updateUser);
}
