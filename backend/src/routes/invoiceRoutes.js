const express = require("express");
const router = express.Router();
const {
  getAllInvoices,
  getMyInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllInvoices);
router.get("/myinvoices", authenticate, getMyInvoices);
router.get("/:id", authenticate, getInvoice);
router.put("/:id", authenticate, updateInvoice);
router.delete("/:id", authenticate, deleteInvoice);

module.exports = router;
