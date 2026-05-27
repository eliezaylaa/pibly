const postController = require("../controllers/postController");
const pool = require("../config/db");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Post Controller", () => {
  const timestamp = Date.now();
  const email = `postctrl_${timestamp}@testpibly.xyz`;
  let userId, postId;

  beforeAll(async () => {
    const user = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ["Post Test User", email, "hashedpass", "user"],
    );
    userId = user.rows[0].id;

    const post = await pool.query(
      "INSERT INTO posts (user_id, title, description, category, price) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [userId, "Test Post", "Test Description", "Tech", 15],
    );
    postId = post.rows[0].id;
  });

  test("getPost - not found", async () => {
    const req = { params: { id: "99999" }, user: { id: userId, role: "user" } };
    const res = mockRes();
    await postController.getPost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getPost - success", async () => {
    const req = {
      params: { id: postId.toString() },
      user: { id: userId, role: "user" },
    };
    const res = mockRes();
    await postController.getPost(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getAllPosts - success", async () => {
    const req = { query: {} };
    const res = mockRes();
    await postController.getAllPosts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getAllPostsAdmin - unauthorized", async () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    await postController.getAllPostsAdmin(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("createPost - missing fields", async () => {
    const req = { body: { title: "" }, user: { id: userId } };
    const res = mockRes();
    await postController.createPost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deletePost - unauthorized", async () => {
    const req = {
      params: { id: postId.toString() },
      user: { id: 99999, role: "user" },
    };
    const res = mockRes();
    await postController.deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM posts WHERE id = $1", [postId]);
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
  });
});
