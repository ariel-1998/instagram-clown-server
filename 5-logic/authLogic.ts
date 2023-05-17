import { OkPacket } from "mysql2";
import { execute } from "../2-utils/dal";
import { UserModel } from "../4-models/UserModel";
import * as dotenv from "dotenv";
import { encryptPassword } from "../2-utils/encryptPassword";

dotenv.config();

export const IMG_TYPE = ".png";

//login
export async function login(
  username: string,
  password: string
): Promise<UserModel> {
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  const hashedPassword = encryptPassword(password);
  const params = [username, hashedPassword];
  const [res] = await execute<UserModel[]>(query, params);
  return res[0];
}

//register
export async function createUser(user: UserModel): Promise<UserModel> {
  const { username, password, role, isActive } = user;
  const hashedPassword = encryptPassword(password);
  const params = [username, hashedPassword, role];
  const query = `INSERT INTO users 
    (username, password, role)
    VALUES(?,?,?)`;

  const [res] = await execute<OkPacket>(query, params);
  const id = res.insertId;
  return {
    id,
    username,
    role,
    isActive,
    aboutMe: "",
    isFollowed: true,
    followersAmout: 0,
    followingAmount: 0,
    postsAmount: 0,
  };
}

export async function updatePassword(
  newPassword: string,
  userId: number
): Promise<string | null> {
  const newHashed = encryptPassword(newPassword);
  const params = [newHashed, userId];
  const query = `UPDATE users SET password = ? WHERE id = ?`;
  const [res] = await execute<OkPacket>(query, params);
  return res.affectedRows > 0 ? newHashed : null;
}

// export async function deactivateAccount(username: string, password: string) {
//   const query = `UPDATE users SET password = ? WHERE id = ? AND password = ?`;

// }

// add image to DB after the insertId is returned after user creation
