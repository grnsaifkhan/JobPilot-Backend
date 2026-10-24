import { Router } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { validateBody } from "../../middleware/validate.js";
import { register, login } from "./auth.controller.js";



const router = Router();


router.post('/register',
    validateBody(registerSchema),
    register,
);


router.post('/login',
    validateBody(loginSchema),
    login
);

export default router;