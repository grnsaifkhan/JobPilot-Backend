import { z } from "zod";
import { JobApplicationStatus } from "../../entities/JobApplication.js";

export const createJobSchema = z
  .object({
    companyName: z.string().trim().min(1).max(150),
    jobTitle: z.string().trim().min(1).max(150),
    status: z.enum(JobApplicationStatus).default(JobApplicationStatus.WISHLIST),
    applicationDate: z.iso.date().optional(),
    jobUrl: z.url().optional(),
    notes: z.string().optional(),
  })
  .strict();

export type CreateJobInput = z.infer<typeof createJobSchema>;
