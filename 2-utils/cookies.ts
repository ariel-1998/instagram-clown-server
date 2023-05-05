import { Response } from "express";
import { CookieOptions } from "express-session";
import { maxAge } from "./options";

//dont need it only need express-sessions

export const createCookie = (
  res: Response,
  value: string,
  options?: any //change it to CookieOptions
) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true, //should uncomment it when deploying
    sameSite: "none",
    maxAge,
    ...options,
  };

  res.cookie("session_id", value, cookieOptions);
};
