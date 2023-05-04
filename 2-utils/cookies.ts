import { Response } from "express";
import { CookieOptions } from "express-session";

export const createCookie = (
  res: Response,
  jwt: string,
  options?: CookieOptions
) => {};
