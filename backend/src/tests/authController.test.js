const authController = require("../controllers/authController");
const pool = require("../config/db");

const mockReq = (body = {}, user = {}) => ({ body, user });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Controller", () => {
  const timestamp = Date.now();
  const email = `authctrl_${timestamp}@testpibly.xyz`;

  test("register - missing fields", async () => {
    const req = mockReq({ email: "", password: "", name: "" });
    const res = mockRes();
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("register - invalid email", async () => {
    const req = mockReq({
      email: "notanemail",
      password: "pass123",
      name: "Test",
    });
    const res = mockRes();
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("register - success", async () => {
    const req = mockReq({ email, password: "password123", name: "Test User" });
    const res = mockRes();
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("login - missing fields", async () => {
    const req = mockReq({ email: "", password: "" });
    const res = mockRes();
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("login - wrong password", async () => {
    const req = mockReq({ email, password: "wrongpass" });
    const res = mockRes();
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("refresh - missing token", async () => {
    const req = mockReq({});
    const res = mockRes();
    await authController.refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
  });
});
