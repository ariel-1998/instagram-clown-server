import { NextFunction, Response } from "express";
import { CustomReq } from "../4-models/CustomReq";
import { decode, verify } from "jsonwebtoken";
import * as dotenv from "dotenv";
import { getUserById } from "../5-logic/authLogic";
dotenv.config();


export const adminCreationValidation = async (
    req: CustomReq,
    res: Response,
    next: NextFunction ) => {

    try {
        //check if has token, and verify it
        const token = req.headers.authorization?.substring(7);
        verify(token, process.env.JWT_SECRET);

        //check if admin and add the user to the req object
        const { sub } = decode(token);
        const user = await getUserById(+sub);
        req.user = user;
        next();
    } catch (error) {
        next();
    }
}