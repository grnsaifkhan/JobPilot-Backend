import type {Request, Response, NextFunction} from 'express';
import { error } from 'node:console';

import { map, success, type ZodType } from 'zod';


export function validateBody(schema: ZodType) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if(!result.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failes',
                error: result.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            });
            return;
        }

        req.body = result.data;
        next();
    };
}