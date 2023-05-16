import { Router } from "express";
import { authVerification } from "../3-middleware/authVerification";
import { getUserInfo } from "../5-logic/UserLogic";
import { mediaSchema } from "../4-models/PostModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
export const userRouter = Router();
userRouter.use(authVerification());
userRouter.get("/:userId", async (req, res) => {
    const sessionUserId = req.session.user.id;
    const userId = +req.params.userId;
    //check if redirected for status code 302
    const isRedirected = req.session.redirected;
    //check if requests his own profile and retrive it from session storage
    if (sessionUserId === userId) {
        const storedUser = { ...req.session.user };
        delete storedUser.password;
        res.status(200).json(storedUser);
    }
    const requestedUser = await getUserInfo(sessionUserId, userId);
    if (!requestedUser)
        return res.sendStatus(404);
    //if the user was redirected from auth routes
    if (isRedirected) {
        //make the user followed because he cannot follow himself and save session
        requestedUser.isFollowed = true;
        req.session.user = { ...requestedUser };
        //reset redirect to false for next times
        req.session.redirected = false;
    }
    delete requestedUser.password;
    isRedirected ? res.status(302) : res.status(200);
    res.json(requestedUser);
});
userRouter.put("/:id", async (req, res, next) => {
    // const user: Omit<UserModel, "password"> = req.body;
    // user.id = req.session.user.id;
    // const image = req.files?.profileImg;
    console.log("put");
    // try {
    //   imageSchema
    //     .refine(
    //       (args) =>
    //         args.mimetype.startsWith("image/") && !args.mimetype.endsWith("gif"),
    //       "Profile image can only be image file"
    //     )
    //     .optional()
    //     .parse(image);
    //   userSchema.pick({ username: true, aboutMe: true }).parse(user);
    //   res.sendStatus(200);
    // } catch (e) {
    //   console.log(e);
    //   next(new ZodErrorModel(e));
    // }
});
userRouter.post("/", async (req, res, next) => {
    //update user settings
    // Object.keys(req.files.postImg).forEach((file) => console.log(file));
    const files = req?.files?.postImg;
    try {
        mediaSchema.parse(files);
    }
    catch (error) {
        return next(new ZodErrorModel(error));
    }
    // if (!files) return res.status(400).json({ message: "Media required" });
    // Array.isArray(files);
    res.sendStatus(200);
});
