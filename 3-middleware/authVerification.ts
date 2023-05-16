import { NextFunction, Response } from "express";
import { CustomReq } from "../4-models/CustomReq";
import { UserRole } from "../4-models/UserModel";

export const authVerification = (role?: UserRole) => {
  return (req: CustomReq, res: Response, next: NextFunction) => {
    //check if condition is good
    //if not logged in
    if (req.session.authorize !== true)
      return res.status(401).json({ message: "You are not logged in!" });

    //if role is forbidden

    if (role && req.session.user.role !== role) {
      return res.status(403).json({ message: "This action is forbidden!" });
    }
    console.log("verifing");
    next();
  };
};
