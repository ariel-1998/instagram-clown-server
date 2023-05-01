import { z } from "zod";

export enum UserRole {
    User = "user", Admin = "admin"
}

export enum IsActive {
    True = 1, false = 0
}
export interface UserModel {
    id: number;
    profileImg: string;
    username: string;
    password: string;
    aboutMe: string;
    role: UserRole;
    isActive: IsActive;
}

export const userSchema = z.object({
    id: z.number().optional(),
    profileImg: z.string().optional(),
    username: z.string()
        .min(6, "Username required to be 6-20 chars long")
        .max(20, "Username required to be 6-20 chars long"),
    password: z.string()
        .min(8, "Password required to be 8-20 chars long")
        .max(20, "Password required to be 8-20 chars long"),

    aboutMe: z.string()
        .max(100, "About section can contain up to 100 chars")
        .optional(),
    role: z.nativeEnum(UserRole),
    isActive: z.nativeEnum(IsActive),
})