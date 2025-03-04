const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('gazkifa-db', 'root', 'root', {
    dialect: 'sqlite',  // Using SQLite as the database
    host: './gazkifa-db.sqlite',
});

module.exports = sequelize;
