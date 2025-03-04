const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const Transactions = require("./Transactions.model");

class Customers extends Model {}

Customers.init(
  {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
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
    image: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Customers",
  }
);

Customers.associate = (models) => {
  Customers.hasMany(models.Transactions, {
    foreignKey: "userId",
    as: "Transactions",
  });
};

module.exports = Customers;
