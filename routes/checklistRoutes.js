const express = require('express');
const DispatcherChecklist = require('../models/DispatcherChecklist');
const router = express.Router();

// POST: Save Checklist Data
router.post('/save', async (req, res) => {
    try {
        const { schedule_operations, flight_dispatch, remarks_history, user_name } = req.body;
        const checklist = await DispatcherChecklist.create({
            schedule_operations,
            flight_dispatch,
            remarks_history,
            user_name,
        });
        res.status(201).json({ message: 'Checklist saved successfully!', data: checklist });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving checklist', details: err.message });
    }
});

// GET: Retrieve All Checklist Data
router.get('/all', async (req, res) => {
    try {
        const checklists = await DispatcherChecklist.findAll();
        res.status(200).json(checklists);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching checklist data', details: err.message });
    }
});

module.exports = router;
