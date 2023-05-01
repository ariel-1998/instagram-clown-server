import { Router } from "express";
import { IsActive, UserModel, UserRole, userSchema } from "../4-models/UserModel";
import { ZodErrorModel } from "../4-models/ZodErrorModel";
import { createUser, login } from "../5-logic/authLogic";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import { UploadedFile } from "express-fileupload";
import { adminCreationValidation } from "../3-middleware/adminCreationValidation";
import { CustomReq } from "../4-models/CustomReq";
import { createJwt } from "../2-utils/jwt";

export const authRouter = Router();

//admin can create another admin only, user can be created if its not admin.
authRouter.post("/register", adminCreationValidation, async (req: CustomReq, res) => {
    const rawUser: UserModel = req.body;
    const files = req.files;

    //make user active on registration
    rawUser.isActive = IsActive.True;

    // if admin registers another admin, (admin can only add another admin, else it means anothe user wants to register)
    if (req.user) rawUser.role = UserRole.Admin;
    else rawUser.role = UserRole.User;

    //validate the user inputs
    try {
        userSchema.parse(rawUser);
    } catch (error) {
        return res.status(400).json(new ZodErrorModel(error));
    }

    //insert data to DB, if an error acures that means username already exist
    try {
        const user = await createUser(rawUser);

        //if no image than it successfully created user
        if (!files) {
            const token = createJwt(user)
            return res.status(201).json(token);
        }
        else {
            //need to validate there is only 1 image (need to validate it in zod)
            // {
            //consider checking if there is an image and if there are no more than 1 as a middleware
            // } 
            const profileImg = files.profileImg as UploadedFile;

            //declare the path
            const imgPath = path.join(__dirname, "..", "assets", "profiles", user.profileImg);
            //move the img to path //also check if err triggers
            profileImg.mv(imgPath);

            const token = createJwt(user)
            return res.status(201).json(token);
        }

    } catch (error) {
        return res.status(409).json({ message: "Username already exist" });
    }
});


authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body as UserModel;
    //if there is no username or password
    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
    //get user by credentials
    const user = await login(username, password);
    //if no user found
    if (!user) return res.status(403).json({ message: "Username or password are incorrect" });
    //else create and send token
    const token = createJwt(user);
    res.status(200).json(token);
})
