import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

import { registerUser } from "../../src/modules/auth/auth.service";
import { createUser, findUserByEmail } from "../../src/modules/auth/auth.repository";


vi.mock('../../src/modules/auth/auth.repository.js', () => ({
    createUser: vi.fn(),
    findUserByEmail: vi.fn(),
}));


describe('registerUser', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    })

    it('hashes the password before creating the user', async () => {
        const input = {
            name: 'Saif Khan',
            email: 'saif@example.com',
            password: 'mySecurePass123',
        };

        vi.mocked(findUserByEmail).mockResolvedValue(null);

        vi.mocked(createUser).mockImplementation(async (data) => ({
            id: 1,
            ...data,
            createdAt: new Date('2026-01-01T00:00:00Z'),
        }));


        const result = await registerUser(input);

        expect(findUserByEmail).toHaveBeenCalledWith(input.email);
        expect(createUser).toHaveBeenCalledTimes(1);

        const savedData = vi.mocked(createUser).mock.calls[0]?.[0];

        expect(savedData).toBeDefined();
        expect(savedData?.passwordHash).not.toBe(input.password);

        expect(
            await bcrypt.compare(input.password, savedData!.passwordHash),
        ).toBe(true);

        expect(result.id).toBe(1);
        expect(result.email).toBe(input.email);
    });


    
    it('rejects registration when the email already exists', async () => {
      const input = {
        name: 'Saif Khan',
        email: 'saif@example.com',
        password: 'mySecurePass123',
      };

      vi.mocked(findUserByEmail).mockResolvedValue({
        id: 1,
        name: 'Existing User',
        email: input.email,
        passwordHash: 'existing-password-hash',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      });

      await expect(registerUser(input)).rejects.toThrow(
        'EMAIL_ALREADY_EXISTS',
      );

      expect(createUser).not.toHaveBeenCalled();
    });


    
    it('does not create a user when checking the email fails', async () => {
      const input = {
        name: 'Saif Khan',
        email: 'saif@example.com',
        password: 'mySecurePass123',
      };
  
      vi.mocked(findUserByEmail).mockRejectedValue(
        new Error('Database unavailable'),
      );
  
      await expect(registerUser(input)).rejects.toThrow(
        'Database unavailable',
      );
  
      expect(createUser).not.toHaveBeenCalled();
    });


});