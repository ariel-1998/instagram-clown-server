import { NextFunction, Response, Request } from "express";
import { ErrorModel } from "../4-models/ErrorModel";

export function errorHandler(
  error: ErrorModel,
  req: Request,
  res: Response,
  next: NextFunction
) {
  //log to logger instead
  console.log(
    `Date: ${new Date().toISOString()} \n method: ${req.method} \n URL: 
    ${req.originalUrl} \n ip: ${req.ip}\n`
  );

  res.status(error.code).json({ message: error.message });
}
