import { CorsOptions } from "cors";
import { SessionOptions } from "express-session";

export const corsOptions: CorsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

export const maxAge = 1000 * 60 * 60 * 24; //24 hours

export const sessionOptions: SessionOptions = {
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false, // saves sessionin store even if wasnt modified (if false session will be saved onlyif i modified it)
  name: "session_id",
  cookie: {
    httpOnly: true,
    sameSite: false, //strict let the cookie get to the browser
    // secure: true,
    maxAge,
  },
};
