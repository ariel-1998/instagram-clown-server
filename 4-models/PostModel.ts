import { z } from "zod";

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
    required_error: "Must contain user id",
  }),
  location: z.string().max(45, "Locatoin can contain up to 45 chars"),
});
