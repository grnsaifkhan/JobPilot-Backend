import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate.js";
import { getJobs, createJob } from "./jobs.controller.js";
import { createJobSchema } from "./jobs.validation.js";

const router = Router();

router.get("/", authenticate, getJobs);
router.post("/", authenticate, validateBody(createJobSchema), createJob);

export default router;
