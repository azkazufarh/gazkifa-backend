const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "postgres", // ✅ Supabase default database name (unless changed)
  "postgres.xnklbecsywctfucvwvdp", // ✅ Username
  "RN3K_-ASfWx8Q97", // ✅ Password
  {
    host: "aws-0-ap-southeast-1.pooler.supabase.com", // ✅ Correct host
    port: 6543,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true, // ✅ Supabase requires SSL
        rejectUnauthorized: false,
      },
    },
  }
);

module.exports = sequelize;
