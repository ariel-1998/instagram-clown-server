import { Router } from "express";
import { createPost, deletePost, getPostByPostId, getPostsByUser, } from "../5-logic/postLogic";
import { postSchema } from "../4-models/PostModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { authVerification } from "../3-middleware/authVerification";
import { ErrorHandlerModel } from "../4-models/ErrorModel";
import path from "path";
import { createDir } from "../2-utils/createDir";
import { IMG_TYPE } from "../5-logic/authLogic";
import fs, { promises } from "fs";
export const postRouter = Router();
postRouter.use(authVerification());
postRouter.get("/", async (req, res) => {
    //need to return image too with another route
    const { id: postUserId } = req.body;
    const { id: sessionUserId } = req.session.user;
    if (!postUserId)
        return res.status(400).json({ message: "id of posts creator is required" });
    const posts = await getPostsByUser(sessionUserId, postUserId);
    if (posts)
        return res.status(200).json(posts);
    res.sendStatus(404);
});
postRouter.get("/:postId", async (req, res) => {
    //need to return image too with another route
    const postId = +req.params.postId;
    const { id: userId } = req.session.user;
    const post = await getPostByPostId(userId, postId);
    if (post)
        return res.status(200).json(post);
    res.sendStatus(404);
});
postRouter.post("/", async (req, res, next) => {
    const post = req.body;
    post.userId = req.session.user.id;
    let insertId;
    if (!req.files?.postImg) {
        return res.status(400).json({ message: "Media required" });
    }
    const files = req.files.postImg;
    try {
        //need to also create file schema
        postSchema.parse(post);
        insertId = await createPost(post);
    }
    catch (e) {
        if (e.name === "'ZodError'")
            return next(new ZodErrorModel(e));
        else
            return next(new ErrorHandlerModel(e));
    }
    const dirPath = path.join(__dirname, "..", "1-assets", "images", insertId.toString());
    try {
        await createDir(dirPath);
        files.forEach(async (file, index) => {
            const filePath = path.join(dirPath, `${index + 1}${IMG_TYPE}`); //check if working properly
            await file.mv(filePath);
        });
    }
    catch (error) {
        //add delete post from DB if images throw an error
        await deletePost(insertId, post.userId);
        return next(new ErrorHandlerModel());
    }
    res.sendStatus(201);
});
postRouter.delete("/:postId", async (req, res, next) => {
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
        if (isDeleted && fs.existsSync(dirPath))
            await promises.rmdir(dirPath);
        res.sendStatus(204);
    }
    catch (error) {
        next(new ErrorHandlerModel());
    }
});