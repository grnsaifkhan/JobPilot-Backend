import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

import app from "../../src/app";
import { loginUser } from "../../src/modules/auth/auth.service";

vi.mock("../../src/modules/auth/auth.service.js", () => ({
  loginUser: vi.fn(),
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 200 when login succeeds", async () => {
    vi.mocked(loginUser).mockResolvedValue({
      user: {
        id: 1,
        name: "Saif Khan",
        email: "saif@example.com",
      },
      accessToken: "test-access-token",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "saif@example.com",
      password: "test-access-token",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe("saif@example.com");
    expect(response.body.data.accessToken).toBe("test-access-token");
    expect(response.body.data.user).not.toHaveProperty("passwordHash");
  });

  it("returns 401 when credentials are invalid", async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error("INVALID_CREDENTIALS"));

    const response = await request(app).post("/api/auth/login").send({
      email: "saif@example.com",
      password: "wrongPassword123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("returns 400 when the email is invalid", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "mySecurePass123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
    expect(loginUser).not.toHaveBeenCalled();
  });

  it("returns 500 when an unexpected error occurs", async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error("Database unavailable"));

    const response = await request(app).post("/api/auth/login").send({
      email: "saif@example.com",
      password: "mySecurePass123",
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it("returns 400 when the password is missing", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "saif@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(loginUser).not.toHaveBeenCalled();
  });

  it("returns 400 when the password is empty", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "saif@example.com",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(loginUser).not.toHaveBeenCalled();
  });

  it("passes the email and password to the login service", async () => {
    vi.mocked(loginUser).mockResolvedValue({
      user: {
        id: 1,
        name: "Saif Khan",
        email: "saif@example.com",
      },
      accessToken: "test-access-token",
    });

    await request(app).post("/api/auth/login").send({
      email: "saif@example.com",
      password: "mySecurePass123",
    });

    expect(loginUser).toHaveBeenCalledWith({
      email: "saif@example.com",
      password: "mySecurePass123",
    });
  });

  it("does not return an access token when login fails", async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error("INVALID_CREDENTIALS"));

    const response = await request(app).post("/api/auth/login").send({
      email: "saif@example.com",
      password: "wrongPassword123",
    });

    expect(response.status).toBe(401);
    expect(response.body.data).toBeUndefined();
    expect(response.body).not.toHaveProperty("accessToken");
  });
});
