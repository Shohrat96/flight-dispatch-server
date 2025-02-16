
const express = require('express');
const DispatcherChecklist = require('../models/DispatcherChecklist');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');


router.post('/save', async (req, res) => {
    try {
        const { scheduleOperations, flightDispatch, remarksHistory, dispatcherTakingOver, email } = req.body;

        // Ensure no required fields are missing
        if (!scheduleOperations || !flightDispatch || !remarksHistory || !dispatcherTakingOver) {
            return res.status(400).json({ error: 'One or more required fields are missing.' });
        }

        // Save the data to the database
        const checklist = await DispatcherChecklist.create({
            schedule_operations: scheduleOperations,
            flight_dispatch: flightDispatch,
            remarks_history: remarksHistory,
            dispatchertakingover: dispatcherTakingOver,
            email: email
        });

        res.status(200).json({ message: 'Checklist saved successfully', checklist: data });

    } catch (error) {
        console.error('Error saving checklist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    // try {
    //     const { scheduleOperations, flightDispatch, remarksHistory, email } = req.body;

    //     // Ensure no required fields are missing
    //     if (!scheduleOperations || !flightDispatch || !remarksHistory) {
    //         return res.status(400).json({ error: 'One or more required fields are missing.' });
    //     }

    //     // Save the data to the database
    //     const checklist = await DispatcherChecklist.create({
    //         schedule_operations: scheduleOperations,
    //         flight_dispatch: flightDispatch,
    //         remarks_history: remarksHistory,
    //         email: email
    //     });

    //     res.status(200).json({ message: 'Checklist saved successfully', checklist });

    // } catch (error) {
    //     console.error('Error saving checklist:', error);
    //     res.status(500).json({ error: 'Internal Server Error' });
    // }
});




// GET: Retrieve All Checklist Data
router.get('/all', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('dispatcher_checklist') // Use your actual table name
            .select('*');

        if (error) {
            throw error;
        }

        res.status(200).json(data);

    } catch (err) {
        console.error('Error fetching checklist data:', err);
        res.status(500).json({ error: 'Error fetching checklist data', details: err.message });
    }
    // try {
    //     const checklists = await DispatcherChecklist.findAll();
    //     res.status(200).json(checklists);
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ error: 'Error fetching checklist data', details: err.message });
    // }
});

module.exports = router;
