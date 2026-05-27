const request = require("supertest");
const { app } = require("../index");

let posterToken, helperToken, postId, sessionId, adminToken;

beforeAll(async () => {
  const poster = await request(app).post("/auth/register").send({
    name: "Session Poster",
    email: "sessionposter@pibly.com",
    password: "password123",
  });
  posterToken = poster.body.token;

  const helper = await request(app).post("/auth/register").send({
    name: "Session Helper",
    email: "sessionhelper@pibly.com",
    password: "password123",
  });
  helperToken = helper.body.token;

  const admin = await request(app).post("/auth/register").send({
    name: "Session Admin",
    email: "sessionadmin@pibly.com",
    password: "password123",
  });
  const pool = require("../config/db");
  await pool.query(
    "UPDATE users SET role = 'admin' WHERE email = 'sessionadmin@pibly.com'",
  );
  const login = await request(app).post("/auth/login").send({
    email: "sessionadmin@pibly.com",
    password: "password123",
  });
  adminToken = login.body.token;

  const post = await request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${posterToken}`)
    .send({
      title: "Session Test Post",
      description: "Test",
      category: "Tech",
      price: 10,
    });
  postId = post.body.id;
});

describe("Session Routes", () => {
  test("POST /sessions/join - success", async () => {
    const res = await request(app)
      .post("/sessions/join")
      .set("Authorization", `Bearer ${helperToken}`)
      .send({ post_id: postId });
    expect(res.status).toBe(201);
    sessionId = res.body.id;
  });

  test("POST /sessions/join - own post", async () => {
    const res = await request(app)
      .post("/sessions/join")
      .set("Authorization", `Bearer ${posterToken}`)
      .send({ post_id: postId });
    expect(res.status).toBe(400);
  });

  test("GET /sessions/all - admin", async () => {
    const res = await request(app)
      .get("/sessions/all")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test("GET /sessions/mysessions - success", async () => {
    const res = await request(app)
      .get("/sessions/mysessions")
      .set("Authorization", `Bearer ${helperToken}`);
    expect(res.status).toBe(200);
  });

  test("PUT /sessions/:id/accept - success", async () => {
    const res = await request(app)
      .put(`/sessions/${sessionId}/accept`)
      .set("Authorization", `Bearer ${posterToken}`);
    expect(res.status).toBe(200);
  });

  test("PUT /sessions/:id/end - fixed", async () => {
    const res = await request(app)
      .put(`/sessions/${sessionId}/end`)
      .set("Authorization", `Bearer ${posterToken}`)
      .send({ is_fixed: true });
    expect(res.status).toBe(200);
  });

  test("DELETE /sessions/:id - admin", async () => {
    const res = await request(app)
      .delete(`/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
