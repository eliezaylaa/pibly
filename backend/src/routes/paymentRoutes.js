const express = require("express");
const router = express.Router();
const {
  createPayment,
  confirmPayment,
  refundTransaction,
  getMyTransactions,
  getAllTransactionsAdmin,
  deleteTransaction,
  createPaymentIntent,
} = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, createPayment);
router.post("/create-intent", authenticate, createPaymentIntent);
router.get("/mytransactions", authenticate, getMyTransactions);
router.get("/all", authenticate, getAllTransactionsAdmin);
router.put("/:id/confirm", authenticate, confirmPayment);
router.put("/:id/refund", authenticate, refundTransaction);
router.delete("/:id", authenticate, deleteTransaction);

module.exports = router;
