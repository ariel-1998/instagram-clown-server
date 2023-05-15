import { execute } from "../2-utils/dal";
import { UserModel } from "../4-models/UserModel";

//when user logs in he needs to get thi data about himself
//when entering user profile also needs to get this data
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
  const query = `SELECT u.*, 
  COUNT(CASE WHEN f.followedId = ? THEN true END) AS followersAmount, 
  COUNT(CASE WHEN f.followerId = ? THEN true END) AS followingAmount, 
  COUNT(p.userId) AS postsAmount
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
  //in controlloer needs to check if something returns
  //if so check if requestedUserId === sessionUserId if it does then change isFollowed to true else leave it as is
}
