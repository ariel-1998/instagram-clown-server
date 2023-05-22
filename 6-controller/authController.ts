import { Router } from "express";
import {
  BooleanDB,
  PasswordModel,
  UserModel,
  UserRole,
  passwordSchema,
  userSchema,
} from "../4-models/UserModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { createUser, login, updatePassword } from "../5-logic/authLogic";
import { CustomReq } from "../4-models/CustomReq";
import { authVerification } from "../3-middleware/authVerification";
import { encryptPassword } from "../2-utils/encryptPassword";
import { ErrorHandlerModel } from "../4-models/ErrorModel";
import { getUserInfo } from "../5-logic/UserLogic";

export const authRouter = Router();

//create user.
authRouter.post("/register", async (req: CustomReq, res, next) => {
  const rawUser: UserModel = req.body;
  //make user active on registration and defaulting role = user
  rawUser.isActive = BooleanDB.True;
  rawUser.role = UserRole.User;

  try {
    userSchema.parse(rawUser);
  } catch (error) {
    return next(new ZodErrorModel(error));
  }

  try {
    const user = await createUser(rawUser);
    console.log(user);
    req.session.user = { ...user };
    req.session.authorize = true;
    //return the user without sensitive info like password
    delete user.password;
    return res.status(201).json(user);
  } catch (error) {
    return res.status(409).json({ message: "Username already exist" });
  }
});

authRouter
  .route("/login")
  .get(authVerification(), (req: CustomReq, res) => {
    console.log("get login");
    const user = { ...req.session.user };
    delete user.password;
    console.log(user);

    res.status(200).json(user);
  })

  .post(async (req: CustomReq, res) => {
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
    if (user.isActive === BooleanDB.false) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }
    const userData = await getUserInfo(user.id, user.id);

    req.session.user = { ...userData };
    req.session.authorize = true;
    res.status(200).json(userData);
  });

//also add username change
authRouter.put(
  "/password",
  authVerification(),
  async (req: CustomReq, res, next) => {
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

authRouter.delete("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new ErrorHandlerModel("Server error, Failed to log out"));
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

//create admin
