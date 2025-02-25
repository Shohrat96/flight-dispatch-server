const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// POST: Save Diversion Route Data
router.post('/save', async (req, res) => {
    try {
        const {
            date, flightNumber, aircraft, departureAirport, stdUtc, atdUtc,
            destinationAirportCat, staUtc, crewCat, destAltn, extraFuel,
            divertAirport, ataDivertAirport, divertCause, tafInBp, tafBeforeTakeoff,
            metarInBp, metarBeforeTakeoff, metarArrivalTime, planningAfterDivert, remarks
        } = req.body;



        // Ensure required fields are present
        if (!flightNumber || !aircraft || !departureAirport || !destinationAirportCat || !divertAirport || !divertCause || !remarks || !date || !stdUtc || !atdUtc || !staUtc || !crewCat || !destAltn || !extraFuel || !ataDivertAirport || !tafInBp || !tafBeforeTakeoff || !metarInBp || !metarBeforeTakeoff || !metarArrivalTime || !planningAfterDivert) {

            return res.status(400).json({ error: 'One or more required fields are missing.' });
        }

        // Insert data into Supabase
        const { data, error } = await supabase
            .from('diverted') // Use your actual table name
            .insert([{
                date: date,
                flight_number: flightNumber,
                airc_type: aircraft,
                dep_airp: departureAirport,
                std_utc: stdUtc,
                atd_utc: atdUtc,
                dest_airp_cat: destinationAirportCat,
                sta_utc: staUtc,
                crew_cat: crewCat,
                dest_altn: destAltn,
                extra_fuel: extraFuel,
                divert_airp: divertAirport,
                ata_divert_airport: ataDivertAirport,
                divert_cause: divertCause,
                taf_in_bp: tafInBp,
                taf_before_to: tafBeforeTakeoff,
                metar_in_bp: metarInBp,
                metar_before_to: metarBeforeTakeoff,
                metar_arr_time: metarArrivalTime,
                planning_after_divert: planningAfterDivert,
                remarks
            }])
            .select()
            .maybeSingle();

        // Log the response from Supabase

        if (error) throw error;

        res.status(200).json({ message: 'Diversion route saved successfully', route: data });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// GET: Retrieve All Diversion Routes
router.get('/all', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('diverted')
            .select('*');

        // Log the response from Supabase

        if (error) throw error;

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: 'Error fetching diversion routes', details: error.message });
    }
});

module.exports = router;
