import { Request } from "express";
import { UserModel } from "./UserModel";
import session from "express-session";

export interface CustomReq extends Request {
  session: session.Session &
    Partial<session.SessionData> & { user?: UserModel };
}
