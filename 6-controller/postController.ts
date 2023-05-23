import { Router } from "express";
import {
  createPost,
  deletePost,
  getPostByPostId,
  getPaginatedPostsByUser,
} from "../5-logic/postLogic";
import { PostModel, postSchema } from "../4-models/PostModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { CustomReq } from "../4-models/CustomReq";
import { BooleanDB, UserModel, UserRole } from "../4-models/UserModel";
import { authVerification } from "../3-middleware/authVerification";
import { ErrorHandlerModel } from "../4-models/ErrorModel";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { createDir } from "../2-utils/createDir";
import fs, { promises } from "fs";

export const postRouter = Router();
postRouter.use(authVerification());

postRouter.get("/:postUserId", async (req: CustomReq, res) => {
  //need to return image too with another route
  const { id: sessionUserId } = req.session.user;
  const postUserId = +req.params.postUserId;
  const pageNum = +req.query.pageNum;
  if (!pageNum || pageNum <= 0 || isNaN(pageNum)) {
    return res
      .status(400)
      .json({ message: "pageNum is required to be a positive number" });
  }
  if (!postUserId)
    return res.status(400).json({ message: "id of post creator is required" });

  const posts = await getPaginatedPostsByUser(
    sessionUserId,
    postUserId,
    pageNum
  );

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

//need to check if trigger in DB works and generate  postImg number as auto_icrement
postRouter.post("/", async (req: CustomReq, res, next) => {
  const post: PostModel = req.body;
  post.userId = req.session.user.id;
  let insertId: number;

  if (!req.files?.postImg) {
    return res.status(400).json({ message: "Media required" });
  }
  const files = req.files.postImg as UploadedFile | UploadedFile[];
  //make the post data add the isSingleFile prop by checking if its an array or not
  if (Array.isArray(files)) post.isSingleImg = BooleanDB.false;
  else post.isSingleImg = BooleanDB.True;

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
    await createDir(dirPath);
    if (Array.isArray(files)) {
      files.forEach(async (file, index) => {
        const filePath = path.join(dirPath, `${index + 1}${file.mimetype}`); //check if working properly
        console.log(filePath);
      });
    } else {
      const filePath = path.join(dirPath, `1${files.mimetype}`); //check if working properly
      console.log(filePath);
    }
  } catch (error) {
    //add delete post from DB if images throw an error
    await deletePost(insertId, post.userId);
    return next(new ErrorHandlerModel());
  }

  res.sendStatus(201);
});

postRouter.delete("/:postId", async (req: CustomReq, res, next) => {
  console.log("/post delete");

  try {
    const { id: userId, postsAmount } = req.session.user;
    const postId = req.params.postId;

    const isDeleted = await deletePost(+postId, userId);

    if (isDeleted === false) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delet it" });
    }

    req.session.user.postsAmount = postsAmount - 1;
    const dirPath = path.join(__dirname, "..", "assets", "images", postId);

    if (isDeleted && fs.existsSync(dirPath)) await promises.rmdir(dirPath);

    res.sendStatus(204);
  } catch (error) {
    next(new ErrorHandlerModel());
  }
});

//files need to complete
postRouter.get("/files/:filesDir", (req, res) => {
  const filesDir = req.params.filesDir;
});
