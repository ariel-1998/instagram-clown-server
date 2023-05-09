import { Router } from "express";
import {
  createPost,
  getPostByPostId,
  getPostsByUser,
} from "../5-logic/postLogic";
import { PostModel, postSchema } from "../4-models/PostModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { CustomReq } from "../4-models/CustomReq";
import { UserModel } from "../4-models/UserModel";
import { authVerification } from "../3-middleware/authVerification";
import { ErrorHandlerModel } from "../4-models/ErrorModel";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { createDir } from "../2-utils/createDir";
import { IMG_TYPE } from "../5-logic/authLogic";

export const postRouter = Router();
postRouter.use(authVerification());

postRouter.get("/", async (req: CustomReq, res) => {
  //need to return image too with another route
  const { id: postUserId } = req.body as UserModel;
  const { id: sessionUserId } = req.session.user;

  const posts = await getPostsByUser(sessionUserId, postUserId);

  if (posts) return res.status(200).json(posts);
  res.sendStatus(404);
});

postRouter.get("/:postId", async (req: CustomReq, res) => {
  //need to return image too with another route

  const postId = +req.params.postId;
  const { id: userId } = req.session.user;

  const post = await getPostByPostId(userId, postId);

  if (post) return res.status(200).json(post);
  res.sendStatus(404);
});

postRouter.post("/", async (req: CustomReq, res, next) => {
  const post: PostModel = req.body;
  post.userId = req.session.user.id;

  if (!req.files?.postImg)
    return res.status(400).json({ message: "Image is required" });

  const files = req.files.postImg as UploadedFile[];

  let insertId: number;
  try {
    //need to also create file schema
    postSchema.parse(post);
    insertId = await createPost(post);
  } catch (e) {
    if (e.name === "'ZodError'") return next(new ZodErrorModel(e));
    else return next(new ErrorHandlerModel(e));
  }

  const dirPath = path.join(
    __dirname,
    "..",
    "1-assets",
    "images",
    insertId.toString()
  );

  try {
    let fileCount = 1;
    await createDir(dirPath);

    files.forEach(async (file) => {
      const filePath = path.join(dirPath, `${fileCount}${IMG_TYPE}`); //check if working properly
      await file.mv(filePath);
      fileCount++;
    });
  } catch (error) {
    //add delete post from DB if images throw an error
    return next(new ErrorHandlerModel());
  }

  res.sendStatus(201);
});
