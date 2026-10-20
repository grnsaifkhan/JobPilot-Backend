
import express from 'express';
import pool from './config/database.js';

import jobRoutes from './routes/jobRoutes.js';

const app = express();

// Middleware
app.use(express.json());

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'JobPilot API is running',
  });
});


// Database health-check endpoint
app.get('/api/health/db', async (_req, res) => {
try {
const connection = await pool.getConnection();
connection.release();

res.status(200).json({
  success: true,
  message: 'MySQL connected successfully',
});

} catch (error) {
console.error('Database connection failed:', error);

res.status(500).json({
  success: false,
  message: 'Database connection failed',
});

}
});


// job route
app.use('/api/jobs', jobRoutes)

export default app;
