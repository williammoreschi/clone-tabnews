import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

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

async function deleteHandler(req, res) {
  const sessionToken = req.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(res);
  return res.status(200).json(expiredSession);
}
