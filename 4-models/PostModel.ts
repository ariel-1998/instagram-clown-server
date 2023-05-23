import { z } from "zod";
import { BooleanDB } from "./UserModel";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export interface PostModel {
  id: number;
  userId: number;
  postImg: number;
  text: string;
  title: string;
  createdAt?: Date;
  isSingleImg?: BooleanDB; //remember to implement it in code
  likes: number;
  isLiked: boolean;
  commentsAmount: number;
}

export const postSchema = z.object({
  text: z.string().max(700, "Post can contain up to 700 chars").optional(),
  userId: z.number({
    required_error: "Must contain the user id",
  }),
  title: z.string().max(45, "Title can contain up to 45 chars"),
});

export const imageSchema = z.object({
  name: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "File size is limited to 10MB each"),
  mimetype: z.string(),
});

export const mediaSchema = z.union([
  imageSchema.refine(
    (args) =>
      args.mimetype.startsWith("video/") || args.mimetype.startsWith("image/"),
    "File can only be video, image, or gif"
  ),
  z.array(imageSchema),
]);
