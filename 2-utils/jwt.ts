import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { UserModel } from "../4-models/UserModel";
dotenv.config();

export const createJwt = (user: UserModel) => {
    const { id, username, profileImg, aboutMe, role } = user;
    return jwt.sign({
        sub: id,
        username,
        profileImg,
        aboutMe,
        role,
    }, process.env.JWT_SECRET, { expiresIn: "15m" })
}