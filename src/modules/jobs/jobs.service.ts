import type { z } from "zod";
import type { CreateJobInput } from "./jobs.validation.js";

import { createJobApplication, findJobsByUserId } from "./jobs.repository.js";

export function getJobsByUserId(userId: number) {
  return findJobsByUserId(userId);
}

export function createJob(data: CreateJobInput, userId: number) {
  return createJobApplication(data, userId);
}
