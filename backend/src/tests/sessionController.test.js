const sessionController = require("../controllers/sessionController");
const pool = require("../config/db");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Session Controller", () => {
  const timestamp = Date.now();
  const posterEmail = `sctrlposter_${timestamp}@testpibly.xyz`;
  const helperEmail = `sctrlhelper_${timestamp}@testpibly.xyz`;
  let posterId, helperId, postId, sessionId;

  beforeAll(async () => {
    const poster = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ["Poster", posterEmail, "hashedpass", "user"],
    );
    posterId = poster.rows[0].id;

    const helper = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ["Helper", helperEmail, "hashedpass", "user"],
    );
    helperId = helper.rows[0].id;

    const post = await pool.query(
      "INSERT INTO posts (user_id, title, description, category, price) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [posterId, "Session Test Post", "Description", "Tech", 10],
    );
    postId = post.rows[0].id;

    const session = await pool.query(
      "INSERT INTO sessions (post_id, poster_id, helper_id, status) VALUES ($1, $2, $3, $4) RETURNING id",
      [postId, posterId, helperId, "pending"],
    );
    sessionId = session.rows[0].id;
  });

  test("getAllSessions - unauthorized", async () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    await sessionController.getAllSessions(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("getAllSessions - admin success", async () => {
    const req = { user: { role: "admin" } };
    const res = mockRes();
    await sessionController.getAllSessions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getMySessions - success", async () => {
    const req = { user: { id: posterId, role: "user" } };
    const res = mockRes();
    await sessionController.getMySessions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getSession - success", async () => {
    const req = {
      params: { id: sessionId.toString() },
      user: { id: posterId, role: "user" },
    };
    const res = mockRes();
    await sessionController.getSession(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("acceptSession - not poster", async () => {
    const req = {
      params: { id: sessionId.toString() },
      user: { id: helperId, role: "user" },
    };
    const res = mockRes();
    await sessionController.acceptSession(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("rejectSession - not poster", async () => {
    const req = {
      params: { id: sessionId.toString() },
      user: { id: helperId, role: "user" },
    };
    const res = mockRes();
    await sessionController.rejectSession(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("deleteSession - unauthorized", async () => {
    const req = {
      params: { id: sessionId.toString() },
      user: { role: "user" },
    };
    const res = mockRes();
    await sessionController.deleteSession(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
    await pool.query("DELETE FROM posts WHERE id = $1", [postId]);
    await pool.query("DELETE FROM users WHERE email IN ($1, $2)", [
      posterEmail,
      helperEmail,
    ]);
  });
});
