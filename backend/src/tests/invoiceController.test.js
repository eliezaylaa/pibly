const invoiceController = require("../controllers/invoiceController");
const pool = require("../config/db");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Invoice Controller", () => {
  const timestamp = Date.now();
  const email = `invctrl_${timestamp}@testpibly.xyz`;
  let userId;

  beforeAll(async () => {
    const user = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ["Inv Test", email, "hashedpass", "user"],
    );
    userId = user.rows[0].id;
  });

  test("getAllInvoices - unauthorized", async () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    await invoiceController.getAllInvoices(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("getAllInvoices - admin success", async () => {
    const req = { user: { role: "admin" } };
    const res = mockRes();
    await invoiceController.getAllInvoices(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getMyInvoices - success", async () => {
    const req = { user: { id: userId, role: "user" } };
    const res = mockRes();
    await invoiceController.getMyInvoices(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteInvoice - unauthorized", async () => {
    const req = { params: { id: "99999" }, user: { role: "user" } };
    const res = mockRes();
    await invoiceController.deleteInvoice(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("getInvoice - not found", async () => {
    const req = { params: { id: "99999" }, user: { role: "admin" } };
    const res = mockRes();
    await invoiceController.getInvoice(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
  });
});
