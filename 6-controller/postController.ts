import { Router } from "express";
import { getPostByPostId, getPostsByUser } from "../5-logic/postLogic";
import { PostModel, postSchema } from "../4-models/PostModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { CustomReq } from "../4-models/CustomReq";
import { UserModel } from "../4-models/UserModel";

export const postRouter = Router();

postRouter.get("/", async (req: CustomReq, res) => {
  //need to make it a middleware
  if (!req.session.authorize)
    return res.status(403).json({ message: "You are not logged in!" });

  const { id: postUserId } = req.body as UserModel;
  const { id: sessionUserId } = req.session.user;

  const posts = await getPostsByUser(sessionUserId, postUserId);

  if (posts) return res.status(200).json(posts);
  res.sendStatus(404);
});

postRouter.get("/:postId", async (req: CustomReq, res) => {
  //need to make it a middleware
  if (!req.session.authorize)
    return res.status(403).json({ message: "You are not logged in!" });

  const postId = +req.params.postId;
  const { id: userId } = req.session.user;
  const post = await getPostByPostId(userId, postId);
  if (post) return res.status(200).json(post);
  res.sendStatus(404);
});

postRouter.post("/", async (req, res, next) => {
  const post: PostModel = req.body;
  try {
    postSchema.parse(post);
  } catch (error) {
    return res.status(400).json(new ZodErrorModel(error));
  }

  //continue route
});
