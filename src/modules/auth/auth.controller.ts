import type { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service.js';
import { success } from 'zod';


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


export async function login(req: Request, res: Response): Promise<void> {
    try {
        const result = await loginUser(req.body);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    }catch(error: unknown) {
        if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }


        console.error('Login failed:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
        });
    }
}