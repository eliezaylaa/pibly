const request = require("supertest");
const { app } = require("../index");

let token, adminToken, postId;

beforeAll(async () => {
  const reg = await request(app).post("/auth/register").send({
    name: "Post User",
    email: "postuser@pibly.com",
    password: "password123",
  });
  token = reg.body.token;

  const adminReg = await request(app).post("/auth/register").send({
    name: "Post Admin",
    email: "postadmin@pibly.com",
    password: "password123",
  });
  const pool = require("../config/db");
  await pool.query(
    "UPDATE users SET role = 'admin' WHERE email = 'postadmin@pibly.com'",
  );
  const login = await request(app).post("/auth/login").send({
    email: "postadmin@pibly.com",
    password: "password123",
  });
  adminToken = login.body.token;
});

describe("Post Routes", () => {
  test("POST /posts - create post", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Post",
        description: "Test description",
        category: "Tech",
        price: 15,
      });
    expect(res.status).toBe(201);
    postId = res.body.id;
  });

  test("POST /posts - missing fields", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Post" });
    expect(res.status).toBe(400);
  });

  test("GET /posts - public feed", async () => {
    const res = await request(app).get("/posts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /posts/all - admin only", async () => {
    const res = await request(app)
      .get("/posts/all")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test("GET /posts/me - my posts", async () => {
    const res = await request(app)
      .get("/posts/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test("GET /posts/:id - get post", async () => {
    const res = await request(app)
      .get(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test("PUT /posts/:id - update post", async () => {
    const res = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated",
        description: "Updated desc",
        category: "Tech",
        price: 20,
      });
    expect(res.status).toBe(200);
  });

  test("DELETE /posts/:id - delete post", async () => {
    const res = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
