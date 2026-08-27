import { z } from 'zod';

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(69, "Name is too long")
        .optional(),
    
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid emaill Address"),
    
    password: z
            .string()
            .min(6, "Password must be at least 6 characters long")
            .max(69, "Password is too long")
}).strict();

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid emaill Address"),
    
    password: z
            .string()
            .min(6, "Password must be at least 6 characters long")
            .max(69, "Password is too long")
}).strict();

export type AuthRegisterInput = z.infer<typeof registerSchema>;
export type AuthLoginInput = z.infer<typeof loginSchema>;