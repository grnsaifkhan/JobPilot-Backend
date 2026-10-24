import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../../src/app";
import AppDataSource from "../../../src/config/data-source";
import { User } from "../../../src/entities/User";

const testEmails: string[] = [];

function createTestEmail(): string {
  const email = `login-integration-${crypto.randomUUID()}@example.com`;
  testEmails.push(email);
  return email;
}

describe("POST /api/auth/login (database integration)", () => {
  beforeAll(async () => {
    if (process.env.DB_NAME !== "jobpilot_test") {
      throw new Error("Integration tests must use the jobpilot_test database");
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

  it("logs in a registered user and returns a valid JWT", async () => {
    const email = createTestEmail();
    const password = "SecureTestPassword123!";

    // Register a user through the real API.
    const registrationResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login Integration User",
        email,
        password,
      });

    expect(registrationResponse.status).toBe(201);

    // Log in using the real API and database.
    const response = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data.user).not.toHaveProperty("passwordHash");

    // Verify the JWT using the configured secret.
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured for integration tests");
    }

    const decoded = jwt.verify(response.body.data.accessToken, secret);

    const savedUser = await AppDataSource.getRepository(User).findOneBy({
      email,
    });

    expect(savedUser).not.toBeNull();

    expect(decoded).toMatchObject({
      sub: savedUser!.id,
    });
  });

  it("rejects login when the password is incorrect", async () => {
    const email = createTestEmail();
    const correctPassword = "SecureTestPassword123!";

    // Create a real user in the test database.
    const registrationResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Wrong Password Test User",
        email,
        password: correctPassword,
      });

    expect(registrationResponse.status).toBe(201);

    // Attempt login with an incorrect password.
    const response = await request(app).post("/api/auth/login").send({
      email,
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
    expect(response.body.data).toBeUndefined();
  });

  it("rejects login when the email does not exist", async () => {
    const email = createTestEmail();

    const response = await request(app).post("/api/auth/login").send({
      email,
      password: "SecureTestPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
    expect(response.body.data).toBeUndefined();
  });

  it("rejects an invalid email without querying the database", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "SecureTestPassword123!",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  it("rejects login when the password is missing", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "missing-password@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  it("rejects login when the password is empty", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "empty-password@example.com",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });
});
