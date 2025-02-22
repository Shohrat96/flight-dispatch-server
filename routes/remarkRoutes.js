const express = require('express');
const RemarkModel = require('../models/Remark');
const { supabase, authMiddleware } = require('../config/supabaseClient');
const router = express.Router();


async function ensureValidSession(req, res, next) {

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1]; // Extract the token from "Bearer <token>"

        // Validate the current token
        const { data: user, error: userError } = await supabase.auth.getUser(token);
        console.log("user: ", user);
        console.log("userError: ", userError);

        if (userError || !user) {
            console.log("Session expired or invalid. Attempting to refresh...");

            // Attempt to refresh the session using the token
            const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: token });

            if (refreshError) {
                throw new Error("Session refresh failed. Please log in again.");
            }

            console.log("Session refreshed successfully.");
        }

        next();
    } catch (err) {
        console.error("Session check/refresh failed:", err);
        return res.status(401).json({ error: "Session expired. Please log in again." });
    }
}



// POST: Save remark Data
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { author, remark, flight_data, category } = req.body;
        const { date, flight_number } = flight_data;

        // Insert the new remark into the "remarks" table
        const { data, error } = await supabase.from("remarks").insert([
            {
                flight_number,
                flight_date: date,
                author,
                remark,
                category,
                flight_data,
            },
        ]).select();

        if (error) throw new Error(error.message);

        res.status(201).json({
            message: "Remark saved successfully!",
            data: data[0], // Return the first inserted row
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Error saving remark data",
            details: err.message,
        });
    }
    // try {
    //     const { author, remark, flight_data } = req.body;
    //     const { date, flight_number } = flight_data;

    //     const remarkData = await RemarkModel.create({
    //         flight_number,
    //         flight_date: date,
    //         author,
    //         remark,
    //         flight_data
    //     });
    //     res.status(201).json({ message: 'remark saved successfully!', data: remarkData });
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ error: 'Error saving remark data', details: err.message });
    // }
});

// GET: Retrieve All remark Data
router.get('/all', async (req, res) => {

    try {
        const page = parseInt(req.query?.page) || 1; // Default to page 1
        const limit = 20; // Maximum records per page
        const offset = (page - 1) * limit;

        // Fetch remarks with pagination
        const { data: remarks, error: remarksError } = await supabase
            .from("remarks")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (remarksError) throw new Error(remarksError.message);

        // Get total count of remarks
        const { count, error: countError } = await supabase
            .from("remarks")
            .select("*", { count: "exact", head: true });

        if (countError) throw new Error(countError.message);

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            currentPage: page,
            totalPages,
            totalItems: count,
            remarks,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Error fetching remarks data",
            details: err.message,
        });
    }
    // try {
    //     const page = parseInt(req.query?.page) || 1; // Default to page 1
    //     const limit = 20; // Maximum records per page
    //     const offset = (page - 1) * limit;

    //     const { count, rows } = await RemarkModel.findAndCountAll({
    //         offset,
    //         limit,
    //         order: [['createdAt', 'DESC']], // Optional: Sort by latest first
    //     });
    //     const totalPages = Math.ceil(count / limit);
    //     res.status(200).json({
    //         currentPage: page,
    //         totalPages,
    //         totalItems: count,
    //         remarks: rows
    //     });
    //     // const remarks = await RemarkModel.findAll();
    //     // res.status(200).json(remarks);
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ error: 'Error fetching remarks data', details: err.message });
    // }
});

module.exports = router;
