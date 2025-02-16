// createDemoUser.js
const sequelize = require('./config/database'); // Your Sequelize instance or connection
const User = require("./models/User");

async function createDemoUser() {
    try {
        // Sync all models (create tables if they don't exist)
        await sequelize.sync();

        // Create a demo user
        const demoUser = await User.create({
            email: "demo5@example.com", // Example email
            password: "password11", // Example password (plain text for demo purposes, consider hashing passwords in a real app)
        });

    } catch (error) {
        console.error("Error creating demo user:", error);
    }
}

createDemoUser();
