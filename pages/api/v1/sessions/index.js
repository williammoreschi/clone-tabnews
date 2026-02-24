import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(req, res) {
  const userInputValue = req.body;

  const authenticateUser = await authentication.getAuthenticateUser(
    userInputValue.email,
    userInputValue.password,
  );

  const newSession = await session.create(authenticateUser.id);

  controller.setSessionCookie(newSession.token, res);

  return res.status(201).json(newSession);
}
