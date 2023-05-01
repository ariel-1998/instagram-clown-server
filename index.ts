import express, { json } from "express";
import * as dotenv from "dotenv";
import { authRouter } from "./6-controller/authController";
dotenv.config();

const app = express();

app.use(json());

app.use("/api/users", authRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`running on port ${PORT}`));