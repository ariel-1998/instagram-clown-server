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
  const { username, password, aboutMe, role, isActive } = user;
  const hashedPassword = encryptPassword(password);
  const params = [username, hashedPassword, aboutMe, role];

  const query = `INSERT INTO users 
    (username, password, aboutMe, role)
    VALUES(?,?,?,?)`;

  const [res] = await execute<OkPacket>(query, params);
  const id = res.insertId;

  const profileImg = await addProfileImg(id);

  return {
    id,
    profileImg,
    username,
    aboutMe,
    role,
    isActive,
    password: "",
  };
}

export async function getUserById(id: number): Promise<UserModel> {
  const query = `SELECT * FROM users WHERE id = ?`;
  const [res] = await execute<UserModel[]>(query, [id]);
  return res[0];
}

//add image to DB after the insertId is returned after user creation
export async function addProfileImg(id: Number): Promise<string> {
  const query = `UPDATE users SET profileImg = ? WHERE id = ?`;
  //check if need to make it `${id + IMG_TYPE}`
  const params = [id + IMG_TYPE, id];
  await execute<OkPacket>(query, params);
  return id + IMG_TYPE;
}
