import { Request } from "express";
import { UserModel } from "./UserModel";
import { Session } from "express-session";

export interface CustomReq extends Request {
  session: SessionModel;
}

interface SessionModel extends Session {
  user: UserModel;
  authorize: Boolean;
}
