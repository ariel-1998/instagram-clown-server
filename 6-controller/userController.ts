import { Router } from "express";
import { CustomReq } from "../4-models/CustomReq";
import { authVerification } from "../3-middleware/authVerification";
import { UploadedFile } from "express-fileupload";
import { imageSchema, mediaSchema } from "../4-models/PostModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { UserModel, userSchema } from "../4-models/UserModel";
import { getUserInfo, updateUser } from "../5-logic/UserLogic";
import { createDir } from "../2-utils/createDir";
import path from "path";
import fs, { promises } from "fs";
import { IMG_TYPE } from "../5-logic/authLogic";
import { ErrorHandlerModel } from "../4-models/ErrorModel";

export const userRouter = Router();
userRouter.use(authVerification());

userRouter.get("/:userId", async (req: CustomReq, res) => {
  console.log("/users get");

  const sessionUserId = req.session.user.id;
  const userId = +req.params.userId;
  //check if redirected for status code 302
  const isRedirected = req.session.redirected;

  //check if requests his own profile and retrive it from session storage
  if (sessionUserId === userId && !isRedirected) {
    const storedUser = { ...req.session.user };
    delete storedUser.password;
    return res.status(200).json(storedUser);
  }

  const requestedUser = await getUserInfo(sessionUserId, userId);
  if (!requestedUser) return res.sendStatus(404);

  //if the user was redirected from auth routes
  if (isRedirected) {
    //make the user followed because he cannot follow himself and save session
    requestedUser.isFollowed = true;
    req.session.user = { ...requestedUser };
    //reset redirect to false for next times
    req.session.redirected = false;
  }
  delete requestedUser.password;
  if (isRedirected) return res.status(302).json(requestedUser);
  res.status(200).json(requestedUser);
});

userRouter.put("/", async (req: CustomReq, res, next) => {
  const user: Omit<UserModel, "username" | "password"> = req.body;
  user.id = req.session.user.id;
  const image = req.files?.profileImg as UploadedFile;

  try {
    imageSchema
      .refine(
        (args) =>
          args.mimetype.startsWith("image/") && !args.mimetype.endsWith("gif"),
        "Profile image can only be image file"
      )
      .optional()
      .parse(image);

    userSchema.pick({ aboutMe: true }).parse(user);
  } catch (e) {
    next(new ZodErrorModel(e));
  }

  try {
    await updateUser(user);
    const dirPath = path.join(__dirname, "..", "1-assets", "profiles");
    const imgPath = path.join(dirPath, `${user.id}${IMG_TYPE}`);
    await createDir(dirPath);
    if (fs.existsSync(imgPath)) {
      await promises.rm(imgPath);
    }
    if (image) await image.mv(imgPath);
  } catch (error) {
    next(new ErrorHandlerModel());
  }
  res.sendStatus(200);
});

// userRouter.post("/", async (req: CustomReq, res, next) => {
//   //update user settings
//   // Object.keys(req.files.postImg).forEach((file) => console.log(file));
//   const files = req?.files?.postImg;

//   try {
//     mediaSchema.parse(files);
//   } catch (error) {
//     return next(new ZodErrorModel(error));
//   }
//   // if (!files) return res.status(400).json({ message: "Media required" });
//   // Array.isArray(files);
//   res.sendStatus(200);
// });
