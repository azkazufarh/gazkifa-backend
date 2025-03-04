const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
1;

class Transactions extends Model {}

Transactions.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("IN", "OUT"),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Transactions",
  }
);

Transactions.associate = (models) => {
  Transactions.belongsTo(models.Customers, {
    foreignKey: "userId",
    as: "Customer",
  }); // Associate with Customers
  Transactions.belongsTo(models.Products, {
    foreignKey: "productId",
    as: "Product",
  }); // Associate with Products
};

module.exports = Transactions;
