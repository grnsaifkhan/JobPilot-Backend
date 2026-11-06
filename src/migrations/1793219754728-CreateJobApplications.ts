import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobApplications1793219754728 implements MigrationInterface {
    name = 'CreateJobApplications1793219754728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`job_applications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`companyName\` varchar(150) NOT NULL, \`jobTitle\` varchar(150) NOT NULL, \`status\` enum ('WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'WISHLIST', \`applicationDate\` date NOT NULL DEFAULT CURRENT_DATE, \`jobUrl\` varchar(2048) NULL, \`notes\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, INDEX \`IDX_job_applications_user_date\` (\`userId\`, \`applicationDate\`), INDEX \`IDX_job_applications_user_status\` (\`userId\`, \`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`job_applications\` ADD CONSTRAINT \`FK_f5d132e5bfd7d396afb6458e71c\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_applications\` DROP FOREIGN KEY \`FK_f5d132e5bfd7d396afb6458e71c\``);
        await queryRunner.query(`DROP INDEX \`IDX_job_applications_user_status\` ON \`job_applications\``);
        await queryRunner.query(`DROP INDEX \`IDX_job_applications_user_date\` ON \`job_applications\``);
        await queryRunner.query(`DROP TABLE \`job_applications\``);
    }

}
