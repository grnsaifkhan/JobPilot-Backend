import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "./User.js";

export enum JobApplicationStatus {
  WISHLIST = "WISHLIST",
  APPLIED = "APPLIED",
  INTERVIEW = "INTERVIEW",
  OFFER = "OFFER",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

@Entity({ name: "job_applications" })
@Index("IDX_job_applications_user_status", ["user", "status"])
@Index("IDX_job_applications_user_date", ["user", "applicationDate"])
export class JobApplication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  companyName!: string;

  @Column({ type: "varchar", length: 150 })
  jobTitle!: string;

  @Column({
    type: "enum",
    enum: JobApplicationStatus,
    default: JobApplicationStatus.WISHLIST,
  })
  status!: JobApplicationStatus;

  @Column({
    type: "date",
    default: () => "CURRENT_DATE",
  })
  applicationDate!: string;

  @Column({ type: "varchar", length: 2048, nullable: true })
  jobUrl!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt!: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;
}
