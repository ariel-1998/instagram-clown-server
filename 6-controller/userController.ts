import { Router } from "express";
import { CustomReq } from "../4-models/CustomReq";
import { authVerification } from "../3-middleware/authVerification";
import { getUserInfo } from "../5-logic/UserLogic";

export const userRouter = Router();

userRouter.use(authVerification());

userRouter.get("/:userId", async (req: CustomReq, res) => {
  const sessionUserId = +req.session.id;
  const userId = +req.params.userId;

  const requestedUser = await getUserInfo(sessionUserId, userId);
  if (requestedUser) {
    delete requestedUser.password;
    return res.status(200).json(requestedUser);
  }
  res.status(404).json({ message: "Profile not found!" });
});

userRouter.post("/", async (req: CustomReq, res) => {
  //update user settings
});
