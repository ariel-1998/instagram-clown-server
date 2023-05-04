import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { UserModel } from "../4-models/UserModel";
dotenv.config();

export const createJwt = (user: UserModel, expiration: string = "15") => {
  const { id, username, profileImg, aboutMe, role } = user;
  return jwt.sign(
    {
      aboutMe,
      sub: id,
      username,
      profileImg,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: expiration }
  );
};
