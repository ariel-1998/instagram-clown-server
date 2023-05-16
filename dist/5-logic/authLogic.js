import { execute } from "../2-utils/dal";
import * as dotenv from "dotenv";
import { encryptPassword } from "../2-utils/encryptPassword";
dotenv.config();
export const IMG_TYPE = ".png";
//login
export async function login(username, password) {
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    const hashedPassword = encryptPassword(password);
    const params = [username, hashedPassword];
    const [res] = await execute(query, params);
    return res[0];
}
//register
export async function createUser(user) {
    const { username, password, aboutMe, role, isActive } = user;
    const hashedPassword = encryptPassword(password);
    const params = [username, hashedPassword, aboutMe, role];
    const query = `INSERT INTO users 
    (username, password, aboutMe, role)
    VALUES(?,?,?,?)`;
    const [res] = await execute(query, params);
    const id = res.insertId;
    return {
        id,
        username,
        aboutMe,
        role,
        isActive,
        isFollowed: true,
        followersAmout: 0,
        followingAmount: 0,
        postsAmount: 0,
    };
}
export async function updatePassword(newPassword, userId) {
    const newHashed = encryptPassword(newPassword);
    const params = [newHashed, userId];
    const query = `UPDATE users SET password = ? WHERE id = ?`;
    const [res] = await execute(query, params);
    return res.affectedRows > 0 ? newHashed : null;
}
// export async function deactivateAccount(username: string, password: string) {
//   const query = `UPDATE users SET password = ? WHERE id = ? AND password = ?`;
// }
// add image to DB after the insertId is returned after user creation
