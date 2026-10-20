import { Router } from 'express';
import { getJobs } from '../controllers/jobController.js'

const router = Router();

router.get('/', getJobs);

export default router;