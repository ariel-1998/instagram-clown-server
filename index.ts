import express, { json } from "express";
import * as dotenv from "dotenv";
import { authRouter } from "./6-controller/authController";
import session from "express-session"; //need to check memory store
import cors from "cors";
import fileUpload from "express-fileupload";
import { corsOptions, sessionOptions } from "./2-utils/options";
import { postRouter } from "./6-controller/postController";
import { errorHandler } from "./3-middleware/errorHandler";
import { userRouter } from "./6-controller/userController";
import path from "path";
import { postLikesRouter } from "./6-controller/postLikesController";
dotenv.config();

const app = express();

app.use(cors(corsOptions));

app.use(json());
app.use(fileUpload());
app.use(session(sessionOptions));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/posts-likes", postLikesRouter);

app.use(errorHandler);
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`running on port ${PORT}`));
