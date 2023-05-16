import { z } from "zod";
export var UserRole;
(function (UserRole) {
    UserRole["User"] = "user";
    UserRole["Admin"] = "admin";
})(UserRole || (UserRole = {}));
export var IsActive;
(function (IsActive) {
    IsActive[IsActive["True"] = 1] = "True";
    IsActive[IsActive["false"] = 0] = "false";
})(IsActive || (IsActive = {}));
export const passwordSchema = z
    .string({ required_error: "Password is required" })
    .min(8, "Password required to be 8-20 chars long")
    .max(20, "Password required to be 8-20 chars long");
export const userSchema = z.object({
    username: z
        .string({ required_error: "Username is required" })
        .min(6, "Username required to be 6-20 chars long")
        .max(20, "Username required to be 6-20 chars long"),
    password: passwordSchema,
    aboutMe: z
        .string()
        .max(100, "About section can contain up to 100 chars")
        .optional(),
    role: z.nativeEnum(UserRole),
    isActive: z.nativeEnum(IsActive),
});
// export const passwordSchema = z
//   .object({
//     newPassword: z
//       .string()
//       .min(8, "Password required to be 8-20 chars long")
//       .max(20, "Password required to be 8-20 chars long"),
//     oldPassword: z
//       .string()
//       .min(8, "Password required to be 8-20 chars long")
//       .max(20, "Password required to be 8-20 chars long"),
//   })
//   .refine(
//     (args) => args.newPassword !== args.oldPassword,
//     "Old password and new password are identical"
//   );
// export type passwordModel = z.infer<typeof passwordSchema>;
