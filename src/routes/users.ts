import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
  res.send('Users page');
});

export default router;