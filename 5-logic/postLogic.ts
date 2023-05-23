import { OkPacket } from "mysql2";
import { execute } from "../2-utils/dal";
import { PostModel } from "../4-models/PostModel";

const LIMIT = 20;

export async function getPaginatedPostsByUser(
  sessionUserId: number,
  postUserId: number,
  pageNum: number
): Promise<PostModel[]> {
  const offset = (pageNum - 1) * LIMIT;
  const params = [sessionUserId, postUserId];
  const query = `SELECT p.*, count(l.postId) AS likes, count(commentId) as commentsAmount,
  CASE WHEN EXISTS (SELECT 1 FROM likes WHERE postId = p.id AND userId = ?)
       THEN true END AS isLiked
FROM posts p
LEFT JOIN likes l ON p.id = l.postId
left join comments c on c.postId = p.id
WHERE p.userId = ?
GROUP BY p.id
ORDER BY createdAt
LIMIT ${LIMIT} OFFSET ${offset}`;
  const [res] = await execute<PostModel[]>(query, params);
  return res;
}

export async function getPostByPostId(
  userId: number,
  postId: number
): Promise<PostModel> {
  const params = [userId, postId];

  const query = `SELECT p.*, count(l.postId) AS likes, count(commentId) as commentsAmount,
  CASE WHEN EXISTS (SELECT 1 FROM likes WHERE postId = p.id AND userId = ?)
       THEN true END AS isLiked
FROM posts p
LEFT JOIN likes l ON p.id = l.postId
left join comments c on c.postId = p.id
WHERE p.id = ?
GROUP BY p.id`;
  const [res] = await execute<PostModel[]>(query, params);
  return res[0];
}

export async function createPost(post: PostModel): Promise<number> {
  const { text, userId, title } = post;
  const params = [text, userId, title];
  const query = `INSERT INTO posts (text, userId, title) VALUES(?,?,?)`;
  const [res] = await execute<OkPacket>(query, params);
  return res.insertId;
}

export async function deletePost(
  postId: number,
  userId: number
): Promise<boolean> {
  const query = `DELETE FROM posts WHERE id = ? AND userId = ?`;
  const [res] = await execute<OkPacket>(query, [postId, userId]);
  return res.affectedRows > 0;
}
