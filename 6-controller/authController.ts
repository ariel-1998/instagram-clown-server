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

export const authRouter = Router();

//create user.
authRouter.post("/register", async (req: CustomReq, res) => {
  const rawUser: UserModel = req.body;
  const files = req.files;

  //make user active on registration and defaulting role = user
  rawUser.isActive = IsActive.True;
  rawUser.role = UserRole.User;

  //validate the user inputs
  try {
    userSchema.parse(rawUser);
  } catch (error) {
    res.status(400).json(new ZodErrorModel(error));
    return;
  }

  //insert data to DB, if an error acures that means username already exist
  try {
    const user = await createUser(rawUser);

    //if no image than it successfully created user
    let isImgMoved = false;

    if (files) {
      //check file with zod schema
      const profileImg = files.profileImg as UploadedFile;

      //declare the path
      const imgPath = path.join(
        __dirname,
        "..",
        "1assets",
        "profiles",
        user.profileImg
      );
      //move the img to path //also check if err triggers
      try {
        await profileImg.mv(imgPath);
        isImgMoved = true;
      } catch (error) {
        //move error to logger
        console.log("log the error to logger");
      }
    } else isImgMoved = true;

    //else save session by modifing it + save user data + authorize user for next requests

    req.session.user = user;
    req.session.authorize = true;

    //return the user without sensitive info like password
    const userWithouPassword = { ...user };
    delete userWithouPassword.password;

    //if an image was successfully moved
    if (isImgMoved) return res.status(201).json(userWithouPassword);

    //if an image wasnt moved
    return res.status(206).json(userWithouPassword);
  } catch (error) {
    return res.status(409).json({ message: "Username already exist" });
  }
});

authRouter.post("/login", async (req: CustomReq, res) => {
  console.log(req.sessionID);

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
