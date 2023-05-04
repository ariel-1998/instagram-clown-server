import { CorsOptions } from "cors";
import { SessionOptions } from "express-session";

export const corsOptions: CorsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

const maxAge = 1000 * 60 * 60 * 24; //24 hours

export const sessionOptions: SessionOptions = {
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  name: "cook",
  cookie: {
    httpOnly: true,
    // secure: true, //should uncomment it when deploying
    sameSite: "none",
    maxAge,
  },
};
