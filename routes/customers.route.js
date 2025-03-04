const express = require("express");
const multer = require("multer");
const auth = require("../middlewares/auth.middleware");
const {
  newCustomer,
  getCustomers,
  updateCustomer,
} = require("../controllers/customers.controller");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", auth, getCustomers);
router.post("/", auth, upload.single("image"), newCustomer);
router.put("/", auth, upload.single("image"), updateCustomer);

module.exports = router;
