import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from 'supertest';

import app from "../../../src/app";
import AppDataSource from "../../../src/config/data-source";
import { User } from "../../../src/entities/User";


const testEmails: string[] = [];

function createTestEmail(): string {
  const email = `integration-${crypto.randomUUID()}@example.com`;
  testEmails.push(email);
  return email;
}


describe('POST /api/auth/register (database integration)', () => {
    beforeAll(async () => {
        // Safety check: never run this test against the development database.
        if (process.env.DB_NAME !== 'jobpilot_test') {
          throw new Error(
            'Integration tests must use the jobpilot_test database',
          );
        }

        await AppDataSource.initialize();
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
          try {
            const repository = AppDataSource.getRepository(User);
            
            for (const email of testEmails) {
              await repository.delete({ email });
            }
          } finally {
            await AppDataSource.destroy();
          }
        }
    });


    it('registers a user and saves them in MySQL', async () => {
        const testEmail = createTestEmail();

        const response =  await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Integration Test User',
            email: testEmail,
            password: 'SecureTestPassword123!',
        });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe(testEmail);
        expect(response.body.data).not.toHaveProperty('password');
        expect(response.body.data).not.toHaveProperty('passwordHash');

        const savedUser = await AppDataSource.getRepository(User).findOneBy({email: testEmail,});

        expect(savedUser).not.toBe(null);
        expect(savedUser?.name).toBe('Integration Test User');
    });


    
    it('rejects registration when the email already exists', async () => {
        const testEmail = createTestEmail();
        
        const repository = AppDataSource.getRepository(User);

        // Create the first user through the real registration API.
        const firstResponse = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Duplicate Test User',
            email: testEmail,
            password: 'SecureTestPassword123!',
          });
      
        expect(firstResponse.status).toBe(201);
      
        // Attempt to register another user with the same email.
        const secondResponse = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Another User',
            email: testEmail,
            password: 'AnotherSecurePassword123!',
          });
      
        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.success).toBe(false);
        expect(secondResponse.body.message).toBe(
          'An account with this email already exists',
        );
    
        // Confirm that only one user exists with this email.
        const matchingUsers = await repository.count({
          where: { email: testEmail },
        });
    
        expect(matchingUsers).toBe(1);
    });


    
    it('rejects an invalid email without saving a user', async () => {
      const invalidEmail = `invalid-${crypto.randomUUID()}`;

      testEmails.push(invalidEmail);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Email User',
          email: invalidEmail,
          password: 'SecureTestPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');

      const savedUser = await AppDataSource.getRepository(User).findOneBy({
        email: invalidEmail,
      });

      expect(savedUser).toBeNull();
    });


});