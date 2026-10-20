import pool from '../config/database.js';

export async function getAllJobs() {
  const [rows] = await pool.query(
    'SELECT * FROM job_applications ORDER BY created_at DESC'
  );

  return rows;
}