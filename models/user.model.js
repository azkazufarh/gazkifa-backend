const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
    username: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.STRING,
    }
}, {
    sequelize,
    modelName: 'User',
})

module.exports = User;