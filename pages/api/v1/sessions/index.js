import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(req, res) {
  const userInputValue = req.body;

  const authenticateUser = await authentication.getAuthenticateUser(
    userInputValue.email,
    userInputValue.password,
  );

  return res.status(201).json({});
}
