import AppDataSource from "../../config/data-source.js";
import {
  JobApplication,
  JobApplicationStatus,
} from "../../entities/JobApplication.js";

const jobApplicationRepository = AppDataSource.getRepository(JobApplication);

export function findJobsByUserId(userId: number): Promise<JobApplication[]> {
  return jobApplicationRepository.find({
    where: {
      user: { id: userId },
    },
    order: {
      createdAt: "DESC",
    },
  });
}

export function createJobApplication(
  data: {
    companyName: string;
    jobTitle: string;
    status: JobApplicationStatus;
    applicationDate?: string;
    jobUrl?: string;
    notes?: string;
  },
  userId: number,
): Promise<JobApplication> {
  const jobApplication = jobApplicationRepository.create({
    ...data,
    user: { id: userId },
  });

  return jobApplicationRepository.save(jobApplication);
}
