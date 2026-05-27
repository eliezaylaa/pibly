const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUser,
  getMyProfile,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, createUser);
router.get("/search", authenticate, searchUser);
router.get("/myprofile", authenticate, getMyProfile);
router.get("/", authenticate, getAllUsers);
router.get("/:id", authenticate, getUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

module.exports = router;
