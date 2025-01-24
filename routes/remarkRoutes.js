const express = require('express');
const RemarkModel = require('../models/Remark');
const router = express.Router();

// POST: Save remark Data
router.post('/save', async (req, res) => {
    try {
        const { author, remark, flight_data } = req.body;
        const { date, flight_number } = flight_data;

        const remarkData = await RemarkModel.create({
            flight_number,
            flight_date: date,
            author,
            remark,
            flight_data
        });
        res.status(201).json({ message: 'remark saved successfully!', data: remarkData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving remark data', details: err.message });
    }
});

// GET: Retrieve All remark Data
router.get('/all', async (req, res) => {
    try {
        const remarks = await RemarkModel.findAll();
        res.status(200).json(remarks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching remarks data', details: err.message });
    }
});

module.exports = router;
