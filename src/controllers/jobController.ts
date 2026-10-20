import type { Request, Response } from 'express';
import { getAllJobs } from '../services/jobservices.js';

export async function getJobs(
  _req: Request,
  res: Response
) {
  try {
    const jobs = await getAllJobs();

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Failed to fetch jobs:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
    });
  }
}