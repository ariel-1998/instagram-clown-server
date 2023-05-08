import { OkPacket } from "mysql2";
import { execute } from "../2-utils/dal";
import { PostModel } from "../4-models/PostModel";

export async function getPostsByUser(
  sessionUserId: number,
  postUserId: number
): Promise<PostModel[]> {
  const params = [sessionUserId, postUserId];
  // subquery userId = sessionUserId, query userId = postUserId
  const query = `SELECT p.*, count(l.postId) AS likes, 
  CASE WHEN EXISTS (SELECT 1 FROM likes WHERE postId = p.postImg AND userId = ?)
       THEN true END AS isLiked
FROM posts p
LEFT JOIN likes l ON p.postImg = l.postId
WHERE p.userId = ?
GROUP BY p.postImg
ORDER BY createdAt`;
  const [res] = await execute<PostModel[]>(query, params);
  return res;
}

export async function getPostByPostId(
  userId: number,
  postId: number
): Promise<PostModel> {
  const params = [userId, postId];

  const query = `SELECT p.*, count(l.postId) AS likes, 
  CASE WHEN EXISTS (SELECT 1 FROM likes WHERE postId = p.postImg AND userId = ?)
       THEN true END AS isLiked
FROM posts p
LEFT JOIN likes l ON p.postImg = l.postId
WHERE p.postImg = ?
GROUP BY p.postImg`;
  const [res] = await execute<PostModel[]>(query, params);
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

export async function deletePost(
  postId: number,
  userId: number
): Promise<OkPacket> {
  const query = `DELETE FROM posts WHERE postImg = ? AND userId = ?`;
  const [res] = await execute<OkPacket>(query, [postId, userId]);
  return res;
}
