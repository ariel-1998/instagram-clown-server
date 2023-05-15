import { Router } from "express";
import {
  IsActive,
  UserModel,
  UserRole,
  userSchema,
} from "../4-models/UserModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { createUser, login } from "../5-logic/authLogic";
import path from "path";
import { UploadedFile } from "express-fileupload";
import { CustomReq } from "../4-models/CustomReq";
import { createDir } from "../2-utils/createDir";

export const authRouter = Router();

//create user.
authRouter.post("/register", async (req: CustomReq, res, next) => {
  const rawUser: UserModel = req.body;
  //make user active on registration and defaulting role = user
  rawUser.isActive = IsActive.True;
  rawUser.role = UserRole.User;
  //validate the user inputs
  try {
    userSchema.parse(rawUser);
  } catch (error) {
    return next(new ZodErrorModel(error));
  }
  //insert data to DB, if an error acures that means username already exist
  try {
    const user = await createUser(rawUser);
    //else save session by modifing it + save user data + authorize user for next requests
    req.session.user = user;
    req.session.authorize = true;
    //return the user without sensitive info like password
    const userWithouPassword = { ...user };
    delete userWithouPassword.password;
    return res.status(201).json(userWithouPassword);
  } catch (error) {
    return res.status(409).json({ message: "Username already exist" });
  }
});

authRouter.post("/login", async (req: CustomReq, res) => {
  const { username, password } = req.body as UserModel;
  //if there is no username or password
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  //get user by credentials
  const user = await login(username, password);
  //if no user found
  if (!user)
    return res
      .status(403)
      .json({ message: "Username or password are incorrect" });
  //else save session by modifing it + save user data + authorize user for next requests

  req.session.user = user;
  req.session.authorize = true;

  //return the user without sensitive info like password
  const userWithouPassword = { ...user };
  delete userWithouPassword.password;

  res.status(200).send(userWithouPassword);
});

//create admin

//create get jwt
