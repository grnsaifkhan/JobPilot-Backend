import type { Response } from "express";
import type { AuthenticationRequest } from "../../middleware/authenticate.js";
import {
  getJobsByUserId,
  createJob as createJobService,
} from "./jobs.service.js";
import type { CreateJobInput } from "./jobs.validation.js";

export async function getJobs(
  req: AuthenticationRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId;

  if (userId === undefined) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const jobs = await getJobsByUserId(userId);

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Failed to fetch job applications:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch job applications",
    });
  }
}

export async function createJob(
  req: AuthenticationRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId;

  if (userId === undefined) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const jobData = req.body as CreateJobInput;

    const job = await createJobService(jobData, userId);

    res.status(201).json({
      success: true,
      message: "Job application created successfully",
      data: job,
    });
  } catch (error) {
    console.error("Failed to create job application:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create job application",
    });
  }
}
