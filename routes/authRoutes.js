const express = require('express');
// const { getFlights, mapAndInsertFlights } = require('../controllers/flightController');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Import the User model
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // Get the secret from .env


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the provided password matches the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const payload = { email: user.email };

        // Generate JWT token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Return the token to the client
        res.json({ token, email: user.email });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ where: { email: decoded.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("user: ", user);

        // Validate old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // Assign raw new password (hook will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = router;
