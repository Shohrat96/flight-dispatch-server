
const express = require('express');
const DispatcherChecklist = require('../models/DispatcherChecklist');
const router = express.Router();

router.post('/save', async (req, res) => {
    try {
        const { scheduleOperations, flightDispatch, remarksHistory, email } = req.body;

        // Ensure no required fields are missing
        if (!scheduleOperations || !flightDispatch || !remarksHistory) {
            return res.status(400).json({ error: 'One or more required fields are missing.' });
        }

        // Log the data for debugging
        // console.log('scheduleOperations:', scheduleOperations);
        // console.log('flightDispatch:', flightDispatch);
        // console.log('remarksHistory:', remarksHistory);

        // Save the data to the database
        const checklist = await DispatcherChecklist.create({
            schedule_operations: scheduleOperations,
            flight_dispatch: flightDispatch,
            remarks_history: remarksHistory,
            email: email
        });

        res.status(200).json({ message: 'Checklist saved successfully', checklist });

    } catch (error) {
        console.error('Error saving checklist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
