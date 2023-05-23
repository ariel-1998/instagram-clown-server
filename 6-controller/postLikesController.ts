import { Router } from "express";
import { CustomReq } from "../4-models/CustomReq";
import { authVerification } from "../3-middleware/authVerification";
import { PostLikeModel } from "../4-models/PostLikeModel";
import { addLikeToPost, deleteLikeFromPost } from "../5-logic/postLikesLogic";

export const postLikesRouter = Router();
postLikesRouter.use(authVerification());

postLikesRouter.post("/", async (req: CustomReq, res) => {
  const { id: userId } = req.session.user;
  const { postId } = req.body as PostLikeModel; //check if works when i send string from frontend
  if (!postId) return res.status(400).json({ message: "postId is required" });
  try {
    await addLikeToPost({ postId, userId });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(409);
  }
});

postLikesRouter.delete("/:postId", async (req: CustomReq, res) => {
  const postId = +req.params.postId;
  const { id: userId } = req.session.user;
  const isSuccessful = deleteLikeFromPost({ postId, userId });
  if (isSuccessful) return res.sendStatus(204);
  res.sendStatus(404);
});
