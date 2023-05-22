import { OkPacket } from "mysql2";
import { execute } from "../2-utils/dal";
import { UserModel } from "../4-models/UserModel";

// export async function getUsersPaginated(requestedUserId: number) {}

export async function getSuggestedUsers(userId: number) {
  // const query = `WITH e AS (
  //   SELECT DISTINCT u.*, f.followedId
  //   FROM users u
  //   JOIN followers f ON u.id = f.followedId
  //   WHERE f.followerId <> ?
  // )
  // SELECT *
  // FROM e
  // WHERE NOT EXISTS (
  //   SELECT 1
  //   FROM followers
  //   WHERE followerId = ?
  //     AND followedId = e.followedId
  // )`;

  // most likely to work
  const query = `WITH e AS (
    SELECT DISTINCT u.*, f.followedId
    FROM users u
    JOIN followers f ON u.id = f.followedId
    WHERE f.followerId <> 1 order by rand() limit 30
  )
  SELECT *, (SELECT followerId FROM followers f WHERE f.followedId = e.followedId limit 1) AS followerId
  FROM e
  WHERE NOT EXISTS (
    SELECT 1
    FROM followers
    WHERE followerId = 1
      AND followedId = e.followedId
  ) limit 30`;
  // const query = `WITH e AS (
  //   SELECT DISTINCT u.*, f.followedId
  //   FROM users u
  //   JOIN followers f ON u.id = f.followedId
  //   WHERE f.followerId <> 1
  // )
  // SELECT *, (SELECT followerId FROM followers f WHERE f.followedId = e.followedId limit 1) AS followerId
  // FROM e
  // WHERE NOT EXISTS (
  //   SELECT 1
  //   FROM followers
  //   WHERE followerId = 1
  //     AND followedId = e.followedId
  // )`;
  const [res] = await execute<UserModel[]>(query, [userId, userId]);
  return res;
}

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
