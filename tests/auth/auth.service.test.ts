import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { registerUser, loginUser } from "../../src/modules/auth/auth.service";
import {
  createUser,
  findUserByEmail,
} from "../../src/modules/auth/auth.repository";

vi.mock("../../src/modules/auth/auth.repository.js", () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
}));

describe("registerUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("hashes the password before creating the user", async () => {
    const input = {
      name: "Saif Khan",
      email: "saif@example.com",
      password: "mySecurePass123",
    };

    vi.mocked(findUserByEmail).mockResolvedValue(null);

    vi.mocked(createUser).mockImplementation(async (data) => ({
      id: 1,
      ...data,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    }));

    const result = await registerUser(input);

    expect(findUserByEmail).toHaveBeenCalledWith(input.email);
    expect(createUser).toHaveBeenCalledTimes(1);

    const savedData = vi.mocked(createUser).mock.calls[0]?.[0];

    expect(savedData).toBeDefined();
    expect(savedData?.passwordHash).not.toBe(input.password);

    expect(await bcrypt.compare(input.password, savedData!.passwordHash)).toBe(
      true,
    );

    expect(result.id).toBe(1);
    expect(result.email).toBe(input.email);
  });

  it("rejects registration when the email already exists", async () => {
    const input = {
      name: "Saif Khan",
      email: "saif@example.com",
      password: "mySecurePass123",
    };

    vi.mocked(findUserByEmail).mockResolvedValue({
      id: 1,
      name: "Existing User",
      email: input.email,
      passwordHash: "existing-password-hash",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });

    await expect(registerUser(input)).rejects.toThrow("EMAIL_ALREADY_EXISTS");

    expect(createUser).not.toHaveBeenCalled();
  });

  it("does not create a user when checking the email fails", async () => {
    const input = {
      name: "Saif Khan",
      email: "saif@example.com",
      password: "mySecurePass123",
    };

    vi.mocked(findUserByEmail).mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(registerUser(input)).rejects.toThrow("Database unavailable");

    expect(createUser).not.toHaveBeenCalled();
  });
});

describe("loginUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const originalJwtSecret = process.env.JWT_SECRET;
  const originalJwtExpiresIn = process.env.JWT_EXPIRES_IN;

  afterEach(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }

    if (originalJwtExpiresIn === undefined) {
      delete process.env.JWT_EXPIRES_IN;
    } else {
      process.env.JWT_EXPIRES_IN = originalJwtExpiresIn;
    }
  });

  it("returns a JWT when the credentials are valid", async () => {
    const password = "mySecurePass123";
    const passwordHash = await bcrypt.hash(password, 12);

    vi.mocked(findUserByEmail).mockResolvedValue({
      id: 1,
      name: "Saif Khan",
      email: "saif@example.com",
      passwordHash,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });

    process.env.JWT_SECRET = "test-secret-for-unit-tests";
    process.env.JWT_EXPIRES_IN = "15m";

    const result = await loginUser({
      email: "saif@example.com",
      password,
    });

    expect(result.user.email).toBe("saif@example.com");
    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe("string");

    const decoded = jwt.verify(
      result.accessToken,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;

    expect(decoded.sub).toBe(1);
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp! - decoded.iat!).toBe(15 * 60);
  });

  it("rejects login when the password is incorrect", async () => {
    const passwordHash = await bcrypt.hash("correctPassword123", 12);

    vi.mocked(findUserByEmail).mockResolvedValue({
      id: 1,
      name: "Saif Khan",
      email: "saif@example.com",
      passwordHash,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });

    const password = "wrongPassword123";

    await expect(
      loginUser({
        email: "saif@example.com",
        password,
      }),
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("rejects login when the email does not exist", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);

    await expect(
      loginUser({
        email: "unknown@example.com",
        password: "somePassword123",
      }),
    ).rejects.toThrow("INVALID_CREDENTIALS");

    expect(findUserByEmail).toHaveBeenCalledWith("unknown@example.com");
  });

  it("propagates an error when the database lookup fails", async () => {
    vi.mocked(findUserByEmail).mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(
      loginUser({
        email: "saif@example.com",
        password: "mySecurePass123",
      }),
    ).rejects.toThrow("Database unavailable");
  });

  it("rejects login when JWT_SECRET is missing", async () => {
    const password = "mySecurePass123";
    const passwordHash = await bcrypt.hash(password, 12);

    vi.mocked(findUserByEmail).mockResolvedValue({
      id: 1,
      name: "Saif Khan",
      email: "saif@example.com",
      passwordHash,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });

    delete process.env.JWT_SECRET;

    await expect(
      loginUser({
        email: "saif@example.com",
        password,
      }),
    ).rejects.toThrow("JWT_SECRET_NOT_CONFIGURED");
  });

  it("uses a 15-minute expiration when JWT_EXPIRES_IN is missing", async () => {
    const password = "mySecurePass123";
    const passwordHash = await bcrypt.hash(password, 12);

    vi.mocked(findUserByEmail).mockResolvedValue({
      id: 1,
      name: "Saif Khan",
      email: "saif@example.com",
      passwordHash,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });

    process.env.JWT_SECRET = "test-secret-for-unit-tests";
    delete process.env.JWT_EXPIRES_IN;

    const result = await loginUser({
      email: "saif@example.com",
      password,
    });

    const decoded = jwt.verify(
      result.accessToken,
      process.env.JWT_SECRET,
    ) as jwt.JwtPayload;

    expect(decoded.exp! - decoded.iat!).toBe(15 * 60);
  });
});
