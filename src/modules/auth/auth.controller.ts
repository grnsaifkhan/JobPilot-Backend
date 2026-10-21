import type { Request, Response } from 'express';
import { registerUser } from './auth.service.js';


export async function register(
    req: Request,
    res: Response,
): Promise<void> {
    try{
        const user = await registerUser(req.body);
        res.status(201).json({
            success: true,
            message: 'user registered successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
            res.status(409).json({
                success: false,
                message: 'An account with this email already exists',
            });
            return;
        }
        console.error('Registration failed:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
        });
    }
}