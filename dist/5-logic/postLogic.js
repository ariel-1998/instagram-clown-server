import { execute } from "../2-utils/dal";
export async function getPostsByUser(sessionUserId, postUserId) {
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
    const [res] = await execute(query, params);
    return res;
}
export async function getPostByPostId(userId, postId) {
    const params = [userId, postId];
    const query = `SELECT p.*, count(l.postId) AS likes, 
  CASE WHEN EXISTS (SELECT 1 FROM likes WHERE postId = p.postImg AND userId = ?)
       THEN true END AS isLiked
FROM posts p
LEFT JOIN likes l ON p.postImg = l.postId
WHERE p.postImg = ?
GROUP BY p.postImg`;
    const [res] = await execute(query, params);
    return res[0];
}
export async function createPost(post) {
    const { text, userId, location } = post;
    const params = [text, userId, location];
    const query = `INSERT INTO posts (text, userId, location) VALUES(?,?,?)`;
    const [res] = await execute(query, params);
    return res.insertId;
}
export async function deletePost(postId, userId) {
    const query = `DELETE FROM posts WHERE postImg = ? AND userId = ?`;
    const [res] = await execute(query, [postId, userId]);
    return res.affectedRows > 0;
}
