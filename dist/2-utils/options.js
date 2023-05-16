export const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
export const maxAge = 1000 * 60 * 60 * 24; //24 hours
export const sessionOptions = {
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "session_id",
    cookie: {
        httpOnly: true,
        sameSite: false,
        // secure: true,
        maxAge,
    },
};
