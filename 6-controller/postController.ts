import { Router } from "express";
import { getPostByPostId, getPostsByUser } from "../5-logic/postLogic";
import { PostModel, postSchema } from "../4-models/PostModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";

export const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const userId = req.body;
  const posts = await getPostsByUser(userId);
  if (posts) return res.status(200).json(posts);
  res.sendStatus(404);
});

postRouter.get("/:postId", async (req, res) => {
  const postId = +req.params;
  const post = await getPostByPostId(postId);
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
