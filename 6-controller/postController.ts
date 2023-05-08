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
  //need to also create file schema
  const post: PostModel = req.body;
  post.userId = req.session.user.id;
  try {
    postSchema.parse(post);
    await createPost(post);
  } catch (e) {
    if (e.name === "'ZodError'") return next(new ZodErrorModel(e));
    else return next(new ErrorHandlerModel(e));
  }

  //continue route
});
