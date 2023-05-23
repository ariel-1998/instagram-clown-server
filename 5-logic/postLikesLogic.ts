import { OkPacket } from "mysql2";
import { execute } from "../2-utils/dal";
import { PostLikeModel } from "../4-models/PostLikeModel";

export async function addLikeToPost(like: PostLikeModel): Promise<OkPacket> {
  const { postId, userId } = like;
  const params = [postId, userId];
  const query = `INSERT INTO likes (postId, userId) VALUES (?,?)`;
  const [res] = await execute<OkPacket>(query, params);
  return res;
}

export async function deleteLikeFromPost(
  like: PostLikeModel
): Promise<Boolean> {
  const { postId, userId } = like;
  const params = [postId, userId];
  const query = `DELETE FROM likes WHERE userId = ? AND vacationId = ?`;
  const [res] = await execute<OkPacket>(query, params);
  return res.affectedRows > 0;
}
