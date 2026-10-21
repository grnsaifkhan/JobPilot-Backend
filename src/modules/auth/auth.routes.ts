import { Router } from "express";
import { registerSchema } from "./auth.schema.js";
import { validateBody } from "../../middleware/validate.js";
import { register } from "./auth.controller.js";



const router = Router();


router.post('/register',
    validateBody(registerSchema),
    register,
);

export default router;