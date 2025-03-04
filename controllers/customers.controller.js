const sharp = require("sharp");
const Customer = require("../models/customers.model");
const { Op } = require("sequelize");

const newCustomer = async (req, res) => {
  try {
    const { userId, fullname, address, category, price, type } = req.body;

    const user = await Customer.findOne({ where: { userId } });

    if (user) {
      return res.status(401).send({ message: "Data user already exists" });
    }

    let imgBuffer = null;
    if (req.file) {
      if (req.file.size > 10 * 1024) {
        imgBuffer = await sharp(req.file.buffer)
          .resize({ width: 200 })
          .jpeg({ quality: 80 })
          .toBuffer();
      } else {
        imgBuffer = req.file.buffer;
      }
    }

    await Customer.create({
      userId,
      fullname,
      address,
      category,
      price,
      type,
      image: imgBuffer,
    });
    return res.status(201).json({
      message: "Customer registered successfully.",
    });
  } catch (e) {
    console.error("Failed to insert new customer ", e);
    return res
      .status(500)
      .json({ message: "Failed to insert new customer", error: e.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const { type, page = 1, limit = 10, search = "" } = req.query;

    // Parse `page` and `limit`
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    // Calculate offset
    const offset = (pageNumber - 1) * limitNumber;

    // Search condition for flexible search
    const searchCondition = search
      ? {
          [Op.or]: [
            { userId: { [Op.like]: `%${search}%` } },
            { fullname: { [Op.like]: `%${search}%` } },
            { category: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    // Fetch customers with pagination and search
    const { rows: customers, count } = await Customer.findAndCountAll({
      attributes: ["userId", "fullname", "address", "category", "price"],
      where: {
        type,
        ...searchCondition,
      },
      limit: limitNumber,
      offset,
    });

    // Return response with metadata
    return res.status(200).json({
      message: "Customers fetched successfully",
      data: customers,
      meta: {
        totalRecords: count,
        currentPage: pageNumber,
        totalPages: Math.ceil(count / limitNumber),
        pageSize: limitNumber,
      },
    });
  } catch (error) {
    console.error("Failed to get customers list", error);
    return res.status(500).json({
      message: "Failed to get customers list",
      error: error.message,
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { userId, fullname, address, category, price } = req.body;

    const user = await Customer.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).send({ message: "Customer not found" });
    }

    let imgBuffer = user.image;
    if (req.file) {
      if (req.file.size > 10 * 1024) {
        imgBuffer = await sharp(req.file.buffer)
          .resize({ width: 200 })
          .jpeg({ quality: 80 })
          .toBuffer();
      } else {
        imgBuffer = req.file.buffer;
      }
    }

    await user.update({
      fullname: fullname || user.fullname,
      address: address || user.address,
      category: category || user.category,
      price: price || user.price,
      image: imgBuffer,
    });

    return res.status(200).json({
      message: "Customer updated successfully.",
    });
  } catch (e) {
    console.error("Failed to update customer ", e);
    return res
      .status(500)
      .json({ message: "Failed to update customer", error: e.message });
  }
};

module.exports = {
  newCustomer,
  getCustomers,
  updateCustomer,
};
