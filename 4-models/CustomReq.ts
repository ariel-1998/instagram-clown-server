import { Request } from "express";
import { UserModel } from "./UserModel";
import { Session } from "express-session";

export interface CustomReq extends Request {
  session: CustomSessionModel;
}

interface CustomSessionModel extends Session {
  user: UserModel;
  authorize: Boolean;
}
