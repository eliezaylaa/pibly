const express = require("express");
const router = express.Router();
const {
  joinSession,
  updateSession,
  acceptSession,
  rejectSession,
  endSession,
  getSession,
  getMySessions,
  getAllSessions,
  deleteSession,
} = require("../controllers/sessionController");
const { authenticate } = require("../middleware/auth");

router.get("/all", authenticate, getAllSessions);
router.get("/mysessions", authenticate, getMySessions);
router.get("/:id", authenticate, getSession);
router.post("/join", authenticate, joinSession);
router.put("/:id", authenticate, updateSession);
router.put("/:id/accept", authenticate, acceptSession);
router.put("/:id/reject", authenticate, rejectSession);
router.put("/:id/end", authenticate, endSession);
router.delete("/:id", authenticate, deleteSession);

module.exports = router;
