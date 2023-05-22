import { z } from "zod";
import { BooleanDB } from "./UserModel";

export interface CommentsModel {
  commentId: number;
  parentCommentId: number;
  userId: number;
  postId: number;
  text: string;
  createdAt: Date;
  isEdited: BooleanDB;
}

const commentSchema = z.object({
  parentCommentId: z
    .union([
      z.number(),
      z
        .string()
        .transform((value) => Number(value))
        .refine((value) => typeof value !== "string", {
          message: "parentCommentId must be a number or undefined",
        }),
    ])
    .optional(),
  userId: z.number({
    required_error: "userId is required",
    invalid_type_error: "userId  must be a number",
  }),
  postId: z.number({
    required_error: "postId is required",
    invalid_type_error: "postId  must be a number",
  }),
  text: z
    .string({ required_error: "text is required" })
    .max(700, "comment can contain upto 700 chars"),
  isEdited: z.nativeEnum(BooleanDB),
});
