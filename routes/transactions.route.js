const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const {
  histories,
  transactionRecord,
  getProductTransactionsLast30Days,
  getTotalExpenses,
  getDistinctDate,
} = require("../controllers/transations.controller");

router.get("/", auth, histories);
router.post("/new", auth, transactionRecord);
router.get("/last30days/:id", auth, getProductTransactionsLast30Days);
router.get("/totalExpenses", auth, getTotalExpenses);
router.get("/distinctDate", auth, getDistinctDate);

module.exports = router;
