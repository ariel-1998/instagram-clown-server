import { OkPacket } from "mysql2";
import { execute } from "../2-utils/dal";
import { PostModel } from "../4-models/PostModel";

export async function getPostsByUser(userId: number): Promise<PostModel[]> {
  const query = `SELECT * FROM posts WHERE userId = ?`;
  const [res] = await execute<PostModel[]>(query, [userId]);
  return res;
}

export async function getPostByPostId(postId: number): Promise<PostModel> {
  const query = `SELECT * FROM posts WHERE postImg = ?`;
  const [res] = await execute<PostModel[]>(query, [postId]);
  return res[0];
}

export async function createPost(post: PostModel): Promise<OkPacket> {
  const { text, userId } = post;
  const params = [text, userId];
  const query = `INSERT INTO posts (text, userId) VALUES(?,?)`;
  const [res] = await execute<OkPacket>(query, params);
  return res;
}

export async function updatePost() {} //check if neended

export async function deletePost(postId: number): Promise<OkPacket> {
  const query = `DELETE FROM posts WHERE postImg = ?`;
  const [res] = await execute<OkPacket>(query, [postId]);
  return res;
}
