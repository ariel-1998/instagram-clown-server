import { OkPacket } from "mysql2";
import { execute } from "../2-utils/dal";
import { UserModel } from "../4-models/UserModel";

export async function getUserInfo(
  sessionUserId: number,
  requestedUserId: number
): Promise<UserModel> {
  const params = [
    requestedUserId,
    requestedUserId,
    sessionUserId,
    requestedUserId,
    requestedUserId,
  ];

  const query = `SELECT u.*, COUNT(CASE WHEN f.followedId = ? THEN true END) AS followersAmount, 
  COUNT(CASE WHEN f.followerId = ? THEN true END) AS followingAmount, 
  COUNT(p.userId) AS postsAmount,
  (SELECT 1 from followers f where followerId = ? AND followedId = ?) AS isFollowed
  FROM users u 
  LEFT JOIN followers f 
  ON u.id = f.followedId OR u.id = f.followerId
  LEFT JOIN posts p 
    ON u.id = p.userId
  WHERE u.id = ?
  GROUP BY u.id`;
  const [res] = await execute<UserModel[]>(query, params);
  return res[0];
}

export async function updateUser(
  user: Omit<UserModel, "password" | "username">
): Promise<boolean> {
  const { aboutMe, id } = user;
  const params = [aboutMe, id];
  const query = `UPDATE users SET aboutMe = ? WHERE id = ?`;
  const [res] = await execute<OkPacket>(query, params);
  return res.affectedRows > 0;
}
