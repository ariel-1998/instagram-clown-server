import { Router } from "express";
import {
  IsActive,
  PasswordModel,
  UserModel,
  UserRole,
  passwordSchema,
  userSchema,
} from "../4-models/UserModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { createUser, login, updatePassword } from "../5-logic/authLogic";
import path from "path";
import { UploadedFile } from "express-fileupload";
import { CustomReq } from "../4-models/CustomReq";
import { createDir } from "../2-utils/createDir";
import { authVerification } from "../3-middleware/authVerification";
import { encryptPassword } from "../2-utils/encryptPassword";
import { ErrorHandlerModel } from "../4-models/ErrorModel";

export const authRouter = Router();

//create user.
authRouter.post("/register", async (req: CustomReq, res, next) => {
  console.log("/register");

  const rawUser: UserModel = req.body;
  //make user active on registration and defaulting role = user
  rawUser.isActive = IsActive.True;
  rawUser.role = UserRole.User;

  try {
    userSchema.parse(rawUser);
  } catch (error) {
    return next(new ZodErrorModel(error));
  }

  try {
    const user = await createUser(rawUser);
    req.session.user = { ...user };
    req.session.authorize = true;
    //return the user without sensitive info like password
    delete user.password;
    return res.status(201).json(user);
  } catch (error) {
    return res.status(409).json({ message: "Username already exist" });
  }
});

authRouter.post("/login", async (req: CustomReq, res) => {
  console.log("/login");

  const { username, password } = req.body as UserModel;
  //if there is no username or password
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  //get user by credentials
  const user = await login(username, password);
  //if no user found
  if (!user) {
    return res
      .status(403)
      .json({ message: "Username or password are incorrect" });
  }
  //else save session by modifing it + save user data + authorize user for next requests

  req.session.user = { ...user };
  req.session.authorize = true;
  req.session.redirected = true;

  res.redirect(302, `/api/users/${user.id}`);
});

authRouter.put(
  "/password",
  authVerification(),
  async (req: CustomReq, res, next) => {
    console.log("/password");

    const { id, password: currentPsw } = req.session.user;
    const { newPassword, oldPassword } = req.body as PasswordModel;

    const oldHash = encryptPassword(oldPassword);

    if (oldHash !== currentPsw) {
      return res.status(400).json({ message: "Current password not verified" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New and old passwords are the same" });
    }

    try {
      passwordSchema.parse(newPassword);
    } catch (e) {
      return next(new ZodErrorModel(e));
    }

    const newHashed = await updatePassword(newPassword, id);

    if (!newHashed) return res.sendStatus(404);
    req.session.user.password = newHashed;
    res.sendStatus(200);
  }
);

authRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new ErrorHandlerModel("Server error, Failed to log out"));
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

//create admin
