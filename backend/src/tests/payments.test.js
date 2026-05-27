const request = require("supertest");
const { app } = require("../index");

let adminToken;

beforeAll(async () => {
  const admin = await request(app).post("/auth/register").send({
    name: "Payment Admin",
    email: "paymentadmin@pibly.com",
    password: "password123",
  });
  const pool = require("../config/db");
  await pool.query(
    "UPDATE users SET role = 'admin' WHERE email = 'paymentadmin@pibly.com'",
  );
  const login = await request(app).post("/auth/login").send({
    email: "paymentadmin@pibly.com",
    password: "password123",
  });
  adminToken = login.body.token;
});

describe("Payment Routes", () => {
  test("GET /payments/all - admin only", async () => {
    const res = await request(app)
      .get("/payments/all")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test("GET /payments/mytransactions - success", async () => {
    const res = await request(app)
      .get("/payments/mytransactions")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
