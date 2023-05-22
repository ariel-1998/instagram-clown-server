import { Router } from "express";
import { CustomReq } from "../4-models/CustomReq";
import { authVerification } from "../3-middleware/authVerification";
import { UploadedFile } from "express-fileupload";
import { imageSchema, mediaSchema } from "../4-models/PostModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { UserModel, userSchema } from "../4-models/UserModel";
import {
  getSuggestedUsers,
  getUserInfo,
  updateUser,
} from "../5-logic/UserLogic";
import { createDir } from "../2-utils/createDir";
import path from "path";
import fs, { promises } from "fs";
import { ErrorHandlerModel } from "../4-models/ErrorModel";

export const userRouter = Router();
userRouter.use(authVerification());

userRouter.get("/", async (req: CustomReq, res) => {
  const userId = +req.session.user.id;
  const users = await getSuggestedUsers(userId);
  if (users) return res.status(200).json(users);
  res.sendStatus(404);
});

userRouter.get("/:userId", async (req: CustomReq, res) => {
  const sessionUserId = req.session.user.id;
  const userId = +req.params.userId;

  const requestedUser = await getUserInfo(sessionUserId, userId);
  if (!requestedUser) return res.sendStatus(404);

  req.session.user = { ...requestedUser };
  delete requestedUser.password;
  res.status(200).json(requestedUser);
});

userRouter.put("/", async (req: CustomReq, res, next) => {
  const user: Omit<UserModel, "username" | "password"> = req.body;
  const { id, profileImg } = req.session.user;
  const image = req.files?.profileImg as UploadedFile;
  user.id = id;

  try {
    imageSchema
      .refine(
        (args) =>
          args.mimetype.startsWith("image/") && !args.mimetype.endsWith("gif"),
        "Profile image can only be image file"
      )
      .parse(image);

    userSchema.pick({ aboutMe: true }).parse(user);
  } catch (e) {
    return next(new ZodErrorModel(e));
  }

  try {
    await updateUser(user);
  } catch (error) {
    return res.status(400).json("aboutMe and profileImg are required");
  }

  try {
    const dirPath = path.join(__dirname, "..", "1-assets", "profiles");
    const imgPath = path.join(dirPath, profileImg);

    await createDir(dirPath);
    if (fs.existsSync(imgPath)) {
      await promises.rm(imgPath);
    }
    if (image) await image.mv(imgPath);
  } catch (error) {
    return next(new ErrorHandlerModel());
  }
  res.sendStatus(200);
});
