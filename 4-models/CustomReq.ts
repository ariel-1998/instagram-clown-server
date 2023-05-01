import { Request } from "express";
import { UserModel } from "./UserModel";

export interface CustomReq extends Request {
    user?: UserModel
}