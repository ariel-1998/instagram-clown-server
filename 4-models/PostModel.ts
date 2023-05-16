import { z } from "zod";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export interface PostModel {
  postImg: number;
  text: string;
  userId: number;
  likes: number;
  isLiked: boolean;
  createdAt?: Date;
  location: string;
}

export const postSchema = z.object({
  // postImg: z.number().optional(),
  text: z.string().max(700, "Post can contain up to 700 chars").optional(),
  userId: z.number({
    required_error: "Must contain the user id",
  }),
  location: z.string().max(45, "Locatoin can contain up to 45 chars"),
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
