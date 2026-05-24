const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getAllPostsAdmin,
  getPost,
  updatePost,
  deletePost,
  getMyPosts,
} = require("../controllers/postController");
const { authenticate } = require("../middleware/auth");

router.get("/", getAllPosts);
router.get("/all", authenticate, getAllPostsAdmin);
router.get("/:id", authenticate, getPost);
router.get("/me", authenticate, getMyPosts);
router.post("/", authenticate, createPost);
router.put("/:id", authenticate, updatePost);
router.delete("/:id", authenticate, deletePost);

module.exports = router;
