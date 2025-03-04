const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const {getProducts, newProduct, deleteProduct, updateProduct, getQuantityProduct, updateStock} = require("../controllers/products.controller");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', auth, getProducts);
router.post('/new', auth, upload.single('image'), newProduct);
router.delete('/:id', auth, deleteProduct);
router.put('/:id', auth, updateProduct);
router.get('/count/:id', auth, getQuantityProduct)
router.put('/stock/:id', auth, updateStock)

module.exports = router;