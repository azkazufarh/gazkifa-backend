const express = require("express");
const cors = require("cors");
const app = express();
const sequelize = require("./config/database");

require("dotenv").config();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

sequelize.sync({ force: false }).then(() => console.log("Database Connected"));

// routes
const userRoutes = require("./routes/user.route");
const costumersRoutes = require("./routes/customers.route");
const productsRoutes = require("./routes/products.route");
const transactionsRoutes = require("./routes/transactions.route");

app.use("/api/auth", userRoutes);
app.use("/api/costumers", costumersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/transactions", transactionsRoutes);

app.get("/", (req, res) => {
  const url = `${req.hostname}:${port}/api`;
  res.status(200).json({ message: "API run successfully!", url });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
