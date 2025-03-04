const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Products extends Model {}

Products.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
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
    modelName: "Products",
  }
);

Products.associate = (models) => {
  Products.hasMany(models.Transactions, {
    foreignKey: "productId",
    as: "Transactions",
  });
};

module.exports = Products;
