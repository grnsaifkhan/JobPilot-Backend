import {email, z} from 'zod';


export const registerSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;