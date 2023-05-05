import express, { json } from "express";
import * as dotenv from "dotenv";
import { authRouter } from "./6-controller/authController";
import session from "express-session"; //need to check memory store
import cors from "cors";
import fileUpload from "express-fileupload";
import { corsOptions, sessionOptions } from "./2-utils/options";
import { postRouter } from "./6-controller/postController";
dotenv.config();

const app = express();

app.use(cors(corsOptions));

app.use(json());
app.use(fileUpload());
app.use(session(sessionOptions));

app.use("/api", authRouter);
app.use("/api/posts", postRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`running on port ${PORT}`));
