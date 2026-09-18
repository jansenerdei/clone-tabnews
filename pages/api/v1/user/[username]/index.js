import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user";
import authorization from "models/authorization";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const userTryingToPatch = request.context.user;
  const userFound = await user.findOneByUserName(username);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:user",
    userFound,
  );

  return response.status(200).json(secureOutputValues);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userTryingToPatch = request.context.user;
  const userInputValues = request.body;
  const updatedUser = await user.update(username, userInputValues);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:user",
    updatedUser,
  );

  return response.status(200).json(secureOutputValues);
}
