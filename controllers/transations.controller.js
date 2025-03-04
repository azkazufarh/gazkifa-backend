const Products = require("../models/products.model");
const Transactions = require("../models/transactions.model");
const sequelize = require("../config/database");
const { QueryTypes, Op, Sequelize } = require("sequelize");

const transactionRecord = async (req, res) => {
  const transaction = await sequelize.transaction(); // Start a database transaction
  try {
    const {
      userId,
      productId,
      type,
      quantity,
      price,
      category,
      createdAt,
      updatedAt,
    } = req.body;

    if (!userId || !productId || !type || !quantity || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (quantity <= 0 || price <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity and price must be positive numbers" });
    }

    const totalPrice = quantity * price;
    const product = await Products.findByPk(productId, { transaction });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (type === "IN") {
      product.quantity = Number(product.quantity) + Number(quantity);
    } else if (type === "OUT") {
      if (product.quantity < quantity) {
        return res
          .status(400)
          .json({ message: "Insufficient quantity in stock" });
      }
      product.quantity -= quantity;
    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    await product.save({ transaction });

    await Transactions.create(
      {
        userId,
        productId,
        type,
        quantity,
        price,
        category,
        totalPrice,
        createdAt,
        updatedAt,
      },
      { transaction }
    );

    await transaction.commit();
    return res
      .status(201)
      .json({ message: "Transaction recorded successfully" });
  } catch (e) {
    await transaction.rollback();
    console.error("Failed to record transaction", e);
    return res.status(500).json({
      message: "Failed to record transaction",
      error: e.message,
    });
  }
};

const getProductTransactionsLast30Days = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    // Ensure product exists
    const product = await Products.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get the current date and date 30 days ago
    const currentDate = new Date();
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(currentDate.getDate() - 30);

    // Query transactions for the product in the last 30 days
    const transactions = await Transactions.findAll({
      where: {
        productId: id,
        type: type,
        createdAt: {
          [Op.between]: [date30DaysAgo, currentDate],
        },
      },
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("createdAt")), "transactionDate"], // Group by date
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalQuantity"], // Sum quantity
      ],
      group: ["transactionDate"], // Group results by the transaction date
      order: [["transactionDate", "ASC"]],
    });

    // Respond with the summarized data
    res.status(200).json({
      message: "Transaction in last 30 days",
      data: {
        id,
        productName: product.name,
        transactions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTotalExpenses = async (req, res) => {
  try {
    const now = new Date();

    // Get the first and last day of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get sum of price for IN type transactions
    const totalExpenses = await Transactions.sum("totalPrice", {
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth,
        },
        type: "IN",
      },
    });

    // Get sum of price for OUT type transactions
    const totalIncome = await Transactions.sum("totalPrice", {
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth,
        },
        type: "OUT",
      },
    });

    const nett = totalIncome - totalExpenses;

    res.status(200).json({
      message: "Total income and expenses fetched successfully",
      data: {
        totalIncome: totalIncome || 0, // If null, return 0
        totalExpenses: totalExpenses || 0, // If null, return 0
        totalNett: nett || 0,
      },
    });
  } catch (e) {
    console.error("Failed to fetch total expenses", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDistinctDate = async (req, res) => {
  try {
    const date = await Transactions.findAll({
      attributes: [
        [
          Sequelize.fn(
            "DISTINCT",
            Sequelize.fn("DATE", Sequelize.col("createdAt"))
          ),
          "date",
        ],
      ],
      order: [[Sequelize.fn("DATE", Sequelize.col("createdAt")), "DESC"]],
    });

    res.status(200).json({
      message: "All dates fetched successfully",
      data: date,
    });
  } catch (error) {
    console.error("Failed to fetch date", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const histories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      type = "",
      createdAt = "",
    } = req.query;

    const offset = (page - 1) * limit;

    let searchCondition = "WHERE 1=1"; // Default condition to allow adding more filters dynamically

    if (search) {
      searchCondition += ` AND (
        P.name LIKE :search 
        OR T.category LIKE :search 
        OR C.fullname LIKE :search 
        OR T.createdAt LIKE :search 
        OR T.type LIKE :search
      )`;
    }

    if (type) {
      searchCondition += " AND T.type = :type";
    }

    if (createdAt) {
      searchCondition += " AND DATE(T.createdAt) = :createdAt"; // Ensures exact date match
    }

    const query = `
            SELECT
                P.name AS productName,
                T.category AS transactionCategory,
                T.quantity AS transactionQuantity,
                T.createdAt AS transactionDate,
                C.fullname AS customerName,
                C.userId AS NIK,
                T.price AS transactionPrice,
                T.totalPrice AS transactionTotal,
                T.type AS type
            FROM Transactions T
                INNER JOIN Customers C ON C.userId = T.userId
                INNER JOIN Products P ON T.productId = P.id
            ${searchCondition}
            ORDER BY T.createdAt DESC
            LIMIT :limit OFFSET :offset
        `;

    const replacements = {
      search: `%${search}%`,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    if (type) replacements.type = type;
    if (createdAt) replacements.createdAt = createdAt;

    const histories = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements,
    });

    // Count total records for pagination metadata
    const countQuery = `
            SELECT COUNT(*) AS total
            FROM Transactions T
                INNER JOIN Customers C ON C.userId = T.userId
                INNER JOIN Products P ON T.productId = P.id
            ${searchCondition}
        `;

    const totalResult = await sequelize.query(countQuery, {
      type: QueryTypes.SELECT,
      replacements,
    });

    const totalRecords = totalResult[0].total;

    res.status(200).json({
      message: "Successfully fetched histories",
      data: histories,
      meta: {
        totalRecords,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecords / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch histories:", error);
    res.status(500).json({
      message: "Failed to fetch histories",
      error: error.message,
    });
  }
};

module.exports = {
  transactionRecord,
  histories,
  getProductTransactionsLast30Days,
  getTotalExpenses,
  getDistinctDate,
};
