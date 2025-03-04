const  User =  require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const register = async (req, res) => {
    try {
        const {username, password, role} = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.findOne({where: {username}})

        if (user) {
            return res.status(404).send({ message: 'Username already exists!' });
        }

        await User.create({username, password: hashedPassword, role});
        return res.status(201).send({message: 'User registered successfully.'});
    } catch (e) {
        console.error("Failed to register", e)
        return res.status(401).send({message: "Failed to register user"});
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ where: {username} });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Check the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30d' } // Token expiration time
        );

        res.status(200).send({ message: 'Login successful', token });
    } catch (error) {
        console.error("Failed to login", error);
        res.status(500).send({ message: "Failed to login user" });
    }
};

module.exports = {
    register,
    login
}