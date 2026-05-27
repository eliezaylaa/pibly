const request = require("supertest");
const { app } = require("../index");

const timestamp = Date.now();
const email = `auth_${timestamp}@pibly.com`;
let token, refreshToken, userId;

describe("Auth Routes", () => {
  test("POST /auth/register - success", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test User",
      email,
      password: "password123",
    });
    expect(res.status).toBe(201);
    token = res.body.token;
    refreshToken = res.body.refreshToken;
    userId = res.body.user.id;
  });

  test("POST /auth/register - duplicate email", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test User",
      email,
      password: "password123",
    });
    expect(res.status).toBe(400);
  });

  test("POST /auth/register - missing fields", async () => {
    const res = await request(app).post("/auth/register").send({ email: "" });
    expect(res.status).toBe(400);
  });

  test("POST /auth/login - success", async () => {
    const res = await request(app).post("/auth/login").send({
      email,
      password: "password123",
    });
    expect(res.status).toBe(200);
    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  test("POST /auth/login - wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email,
      password: "wrongpassword",
    });
    expect(res.status).toBe(400);
  });

  test("POST /auth/refresh - success", async () => {
    const res = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /auth/logout - success", async () => {
    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
