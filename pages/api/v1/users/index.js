import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user";
import activation from "models/activation";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValue = request.body;
  const newUser = await user.create(userInputValue);
  const userTryingToPatch = request.context.user;

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:user",
    newUser,
  );

  return response.status(201).json(secureOutputValues);
}
