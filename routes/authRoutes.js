const express = require('express');
// const { getFlights, mapAndInsertFlights } = require('../controllers/flightController');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Import the User model
const { supabase } = require('../config/supabaseClient');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // Get the secret from .env


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Authenticate user using Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email, password,
            options: {
                shouldCreateUser: false,
                rememberMe: true, // Ensures session persists even after token expiry
            }
        });

        if (error) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Return the session token from Supabase
        res.json({ token: data.session.access_token, email: data.user.email });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
    // const { email, password } = req.body;

    // try {
    //     // Find the user by email
    //     const user = await User.findOne({ where: { email } });

    //     if (!user) {
    //         return res.status(400).json({ message: 'Invalid email or password' });
    //     }

    //     // Check if the provided password matches the stored hashed password
    //     const isMatch = await bcrypt.compare(password, user.password);
    //     if (!isMatch) {
    //         return res.status(400).json({ message: 'Invalid email or password' });
    //     }
    //     const payload = { email: user.email };

    //     // Generate JWT token
    //     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    //     // Return the token to the client
    //     res.json({ token, email: user.email });

    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Server error' });
    // }
});

router.post('/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Get the user session from the token
        const { data: user, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Re-authenticate the user by signing in with the old password
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: user.user.email,
            password: oldPassword,
            options: {
                shouldCreateUser: false,
                rememberMe: true, // Ensures session persists even after token expiry
            }
        });

        if (authError) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // Update the password using Supabase
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

        if (updateError) {
            return res.status(400).json({ message: "Failed to update password" });
        }

        res.json({ message: "Password changed successfully" });

    } catch (error) {
        console.error("Change password error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
    // const { oldPassword, newPassword } = req.body;
    // const token = req.headers.authorization?.split(" ")[1];

    // if (!token) {
    //     return res.status(401).json({ message: "Unauthorized" });
    // }

    // try {
    //     const decoded = jwt.verify(token, JWT_SECRET);
    //     const user = await User.findOne({ where: { email: decoded.email } });

    //     if (!user) {
    //         return res.status(404).json({ message: "User not found" });
    //     }
    //     // Validate old password
    //     const isMatch = await bcrypt.compare(oldPassword, user.password);
    //     if (!isMatch) {
    //         return res.status(400).json({ message: "Old password is incorrect" });
    //     }

    //     // Assign raw new password (hook will hash it)
    //     user.password = newPassword;
    //     await user.save();

    //     res.json({ message: "Password changed successfully" });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: "Server error" });
    // }
});



module.exports = router;
