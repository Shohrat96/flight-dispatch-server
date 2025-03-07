const express = require('express');
const RemarkModel = require('../models/Remark');
const { supabase, authMiddleware } = require('../config/supabaseClient');
const router = express.Router();

// POST: Save remark Data
router.post('/save', async (req, res) => {
    try {
        const { author, remark, flight_data, category, customCategory } = req.body;
        const { date, flight_number } = flight_data;

        // Insert the new remark into the "remarks" table
        const { data, error } = await supabase.from("remarks").insert([
            {
                flight_number,
                flight_date: date,
                author,
                remark,
                category,
                custom_category: customCategory,
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

        const sortColumn = req.query?.sortColumn || "created_at"; // Default sorting column
        const sortOrder = req.query?.sortOrder === "asc" ? true : false; // Default descending


        // Fetch remarks with pagination
        const { data: remarks, error: remarksError } = await supabase
            .from("remarks")
            .select("*")
            .order(sortColumn, { ascending: sortOrder })
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


// GET: Retrieve All Remark Data with Filtering
router.post("/all", async (req, res) => {

    try {
        const page = parseInt(req.query?.page) || 1; // Default to page 1
        const limit = 20; // Maximum records per page
        const offset = (page - 1) * limit;

        // Extract filter values from request body
        const {
            flightNumber,
            flightDateFrom,
            flightDateTo,
            author,
            createdAtFrom,
            createdAtTo,
            remark,
            category,
            sortColumn, sortOrder
        } = req.body;

        // Build the query dynamically
        let query = supabase.from("remarks").select("*", { count: "exact" });

        // Apply filters dynamically if values are provided
        if (flightNumber) {
            // Convert flightNumber to text and perform an exact match
            query = query.eq("flight_number", flightNumber);
        }
        if (flightDateFrom) {
            query = query.gte("flight_date", flightDateFrom);
        }
        if (flightDateTo) {
            query = query.lte("flight_date", flightDateTo);
        }
        if (author) {
            query = query.ilike("author", `%${author}%`);
        }
        if (createdAtFrom) {
            query = query.gte("created_at", createdAtFrom);
        }
        if (createdAtTo) {
            query = query.lte("created_at", createdAtTo);
        }
        if (remark) {
            query = query.ilike("remark", `%${remark}%`);
        }
        if (category) {
            query = query.eq("category", category);
        }

        // Apply sorting dynamically
        const validSortColumns = ["flight_number", "flight_date", "author", "created_at", "category", "remark"];
        const sortBy = validSortColumns.includes(sortColumn) ? sortColumn : "created_at";
        const orderBy = sortOrder === "asc" ? true : false;

        // Apply pagination
        query = query.order(sortBy, { ascending: orderBy }).range(offset, offset + limit - 1);
        // Fetch filtered remarks
        const { data: remarks, error: remarksError } = await query;
        if (remarksError) throw new Error(remarksError.message);

        // Fetch total count with filters applied
        let countQuery = supabase.from("remarks").select("*", { count: "exact", head: true });

        // Apply the same filters to count query
        if (flightNumber) countQuery = countQuery.eq("flight_number", flightNumber);
        if (flightDateFrom) countQuery = countQuery.gte("flight_date", flightDateFrom);
        if (flightDateTo) countQuery = countQuery.lte("flight_date", flightDateTo);

        if (author) countQuery = countQuery.ilike("author", `%${author}%`);
        if (createdAtFrom) countQuery = countQuery.gte("created_at", createdAtFrom);
        if (createdAtTo) countQuery = countQuery.lte("created_at", createdAtTo);

        if (remark) countQuery = countQuery.ilike("remark", `%${remark}%`);
        if (category) countQuery = countQuery.eq("category", category);

        const { count, error: countError } = await countQuery;
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
});


router.get('/categories', async (req, res) => {

    try {
        // Fetch remark categories
        const { data, error } = await supabase.from("remark_categories").select("*");


        if (error) throw new Error(error.message);

        res.status(200).json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Error fetching remarks categories",
            details: err.message,
        });
    }
});


module.exports = router;
