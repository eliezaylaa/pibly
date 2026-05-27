const request = require("supertest");
const { app } = require("../index");

let adminToken, userToken;

beforeAll(async () => {
  const user = await request(app).post("/auth/register").send({
    name: "Report User",
    email: "reportuser@pibly.com",
    password: "password123",
  });
  userToken = user.body.token;

  const admin = await request(app).post("/auth/register").send({
    name: "Report Admin",
    email: "reportadmin@pibly.com",
    password: "password123",
  });
  const pool = require("../config/db");
  await pool.query(
    "UPDATE users SET role = 'admin' WHERE email = 'reportadmin@pibly.com'",
  );
  const login = await request(app).post("/auth/login").send({
    email: "reportadmin@pibly.com",
    password: "password123",
  });
  adminToken = login.body.token;
});

describe("Report Routes", () => {
  test("GET /reports - admin only", async () => {
    const res = await request(app)
      .get("/reports")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("total_users");
    expect(res.body).toHaveProperty("total_revenue");
  });

  test("GET /reports - unauthorized user", async () => {
    const res = await request(app)
      .get("/reports")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test("GET /reports - no token", async () => {
    const res = await request(app).get("/reports");
    expect(res.status).toBe(401);
  });
});
