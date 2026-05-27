const request = require("supertest");
const { app } = require("../index");

let adminToken;

beforeAll(async () => {
  const admin = await request(app).post("/auth/register").send({
    name: "Invoice Admin",
    email: "invoiceadmin@pibly.com",
    password: "password123",
  });
  const pool = require("../config/db");
  await pool.query(
    "UPDATE users SET role = 'admin' WHERE email = 'invoiceadmin@pibly.com'",
  );
  const login = await request(app).post("/auth/login").send({
    email: "invoiceadmin@pibly.com",
    password: "password123",
  });
  adminToken = login.body.token;
});

describe("Invoice Routes", () => {
  test("GET /invoices - admin only", async () => {
    const res = await request(app)
      .get("/invoices")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test("GET /invoices/myinvoices - success", async () => {
    const res = await request(app)
      .get("/invoices/myinvoices")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
