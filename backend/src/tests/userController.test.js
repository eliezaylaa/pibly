const userController = require("../controllers/userController");
const pool = require("../config/db");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Controller", () => {
  const timestamp = Date.now();
  const email = `userctrl_${timestamp}@testpibly.xyz`;
  let userId;

  beforeAll(async () => {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ["Test User", email, "hashedpass", "user"],
    );
    userId = result.rows[0].id;
  });

  test("getUser - not found", async () => {
    const req = { params: { id: "99999" }, user: { id: 1, role: "admin" } };
    const res = mockRes();
    await userController.getUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getUser - success", async () => {
    const req = {
      params: { id: userId.toString() },
      user: { id: userId, role: "user" },
    };
    const res = mockRes();
    await userController.getUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getAllUsers - unauthorized", async () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    await userController.getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("deleteUser - unauthorized", async () => {
    const req = { params: { id: "99999" }, user: { id: 1, role: "user" } };
    const res = mockRes();
    await userController.deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("searchUser - success", async () => {
    const req = { query: { name: "Test" }, user: { id: userId, role: "user" } };
    const res = mockRes();
    await userController.searchUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
  });
});
