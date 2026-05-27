const paymentController = require("../controllers/paymentController");
const pool = require("../config/db");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Payment Controller", () => {
  const timestamp = Date.now();
  const email = `payctrl_${timestamp}@testpibly.xyz`;
  let userId;

  beforeAll(async () => {
    const user = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ["Pay Test", email, "hashedpass", "user"],
    );
    userId = user.rows[0].id;
  });

  test("getAllTransactionsAdmin - unauthorized", async () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    await paymentController.getAllTransactionsAdmin(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("getAllTransactionsAdmin - admin success", async () => {
    const req = { user: { role: "admin" } };
    const res = mockRes();
    await paymentController.getAllTransactionsAdmin(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getMyTransactions - success", async () => {
    const req = { user: { id: userId, role: "user" } };
    const res = mockRes();
    await paymentController.getMyTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteTransaction - unauthorized", async () => {
    const req = { params: { id: "99999" }, user: { role: "user" } };
    const res = mockRes();
    await paymentController.deleteTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
  });
});
