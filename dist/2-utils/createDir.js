import fs, { promises } from "fs";
export async function createDir(path) {
    try {
        if (!fs.existsSync(path)) {
            await promises.mkdir(path, { recursive: true });
        }
    }
    catch (error) {
        //log error to logger
        console.log(error);
        throw error;
    }
}
