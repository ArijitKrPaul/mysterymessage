import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "username must be atleast 2 characters")
  .max(20);

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "please use a valid email" }),
  password: z.string().min(6, "password must be atleast 6 characters"),
});
