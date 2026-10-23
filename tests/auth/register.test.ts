import {describe, it, expect, vi, beforeEach} from 'vitest';
import request from 'supertest';

import app from '../../src/app';
import { registerUser } from '../../src/modules/auth/auth.service.js';



vi.mock('../../src/modules/auth/auth.service.js', () => ({
  registerUser: vi.fn(),
}));


describe('POST /api/auth/register', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns 201 when registration succeeds', async () => {
        vi.mocked(registerUser).mockResolvedValue({
            id: 1,
            name: 'Saif Khan',
            email: 'saif.khan@example.com',
            createdAt: new Date('2026-01-01T00:00:00Z'),
        } as Awaited<ReturnType<typeof registerUser>>);

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Saif Khan',
                email: 'saif@example.com',
                password: 'mySecurePass123',
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('saif.khan@example.com');
        expect(response.body.data).not.toHaveProperty('password');
        expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    it('return 400 when email is invalid', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Saif Khan',
                email: 'not-an.-email',
                password: 'mySecurePass123',
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
            expect(registerUser).not.toHaveBeenCalled();
    });


    
    it('returns 409 when the email already exists', async () => {
      vi.mocked(registerUser).mockRejectedValue(
        new Error('EMAIL_ALREADY_EXISTS'),
      );

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Saif Khan',
          email: 'saif@example.com',
          password: 'mySecurePass123',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        'An account with this email already exists',
      );
    });


    
    it('returns 400 when the name is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'saif@example.com',
          password: 'mySecurePass123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(registerUser).not.toHaveBeenCalled();
    });


    
    it('returns 400 when the password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Saif Khan',
          email: 'saif@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(registerUser).not.toHaveBeenCalled();
    });


    
    it('returns 400 when the password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Saif Khan',
          email: 'saif@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(registerUser).not.toHaveBeenCalled();
    });

    
    it('returns 400 when the name contains only whitespace', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '   ',
          email: 'saif@example.com',
          password: 'mySecurePass123',
        });
    
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(registerUser).not.toHaveBeenCalled();
    });




});