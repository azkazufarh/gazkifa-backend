const sharp = require("sharp");
const Products = require("../models/products.model");
const Transactions = require("../models/transactions.model");
const { Op } = require('sequelize');

const newProduct = async (req, res) => {
    try {
        const { name, quantity, price } = req.body;

        if (!name || !quantity || !price) {
            return res.status(400).json({message: 'Please enter a valid input.'});
        }

        let imgBuffer = null
        if (req.file) {
            if (req.file.size > 10 * 1024) {
                imgBuffer = await sharp(req.file.buffer)
                    .resize({width: 200})
                    .jpeg({ quality: 80 })
                    .toBuffer();
            } else {
                imgBuffer = req.file.buffer
            }
        }

        await Products.create({
            name,
            quantity,
            price,
            image: imgBuffer
        })

        return res.status(201).json({
            message: 'Insert new product successfully.'
        });
    } catch (e) {
        console.error('Failed to insert new product ', e);
        res.status(500).json({ message: "Failed to insert new product", error: e.message });
    }
}

const getProducts = async (req, res) => {
    try {
        const { name } = req.query;
        const where = {};

        if (name) where.name = name;

        const products = await Products.findAll({ where });

        return res.status(200).json({ message: "Products fetched successfully", data: products });
    } catch (e) {
        console.error('Failed to fetched products ', e);
        return res.status(500).json({ message: "Failed to fetched products", error: e.message });
    }
}

const getProductById = async (req, res) => {
    const { id } = req.params;
    const product = await Products.findByPk(id)

    if (!product) {
        return res.status(404).json({message: 'Product not found'});
    }

    return res.status(200).json({message: 'Product updated', data: product});
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Products.findByPk(id)

        if (!product) {
            return res.status(404).json({message: 'Product not found'});
        }

        await product.update(...req.body);
        return res.status(200).json({message: 'Product updated'});
    } catch (e) {
        console.error('Failed to update product ', e);
        return res.status(500).json({ message: "Failed to update product", error: e.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Products.findByPk(id)

        if (!product) {
            return res.status(404).json({message: 'Product not found'});
        }

        await product.destroy();
        return res.status(200).json({message: 'Product deleted!'});
    } catch (e) {
        console.error('Failed to delete product ', e);
        return res.status(500).json({ message: "Failed to delete product", error: e.message });
    }
}

const getQuantityProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Products.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const now = new Date();

        // Find the most recent Monday
        const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1));

        // Get the Sunday after that Monday (7-day range)
        const nextSunday = new Date(lastMonday);
        nextSunday.setDate(lastMonday.getDate() + 6);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month

        const quantityWeeklyProduct = await Transactions.sum('quantity', {
            where: {
                productId: id,
                createdAt: {
                    [Op.gte]: lastMonday, // Start from last Monday
                    [Op.lte]: nextSunday  // End on next Sunday
                },
                type: "OUT"
            },
        });

        const quantityMonthlyProduct = await Transactions.sum('quantity', {
            where: {
                productId: id,
                createdAt: {
                    [Op.gte]: startOfMonth,
                    [Op.lte]: endOfMonth,
                },
                type: "OUT"
            },
        });

        res.status(200).json({
            message: "Count product successfully",
            data: {
                currentQuantity: product.quantity,
                quantityWeekly: quantityWeeklyProduct || 0,
                quantityMonthly: quantityMonthlyProduct || 0,
            }
        });
    } catch (error) {
        console.error('Error fetching product quantities:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateStock = async (req, res) => {
    try {
        const product = await Products.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        product.quantity = req.body.quantity;

        await product.save();

        return res.status(200).json({
            message: 'Stock updated successfully.',
            product
        });

    } catch (e) {
        console.error('Failed to update stock', e);
        res.status(500).json({ message: "Failed to update stock", error: e.message });
    }
};


module.exports = {
    newProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    getProductById,
    getQuantityProduct,
    updateStock
}
