import * as dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();
const config = {
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
};
export const pool = mysql.createPool(config);
export function execute(query, params) {
    return pool.execute(query, params);
}
