const express = require('express');
const { getFlights, mapAndInsertFlights } = require('../controllers/flightController');

const router = express.Router();

// Get all flights
router.get('/', getFlights);

router.post('/upload', async (req, res) => {
    try {
      const rawData = req.body.flights; // Get the parsed data from the request body

      // Call the map and insert function
      const response = await mapAndInsertFlights(rawData);
      
      if (typeof response === "object") {
        res.status(200).json({ message: rawData });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error uploading file data' });
    }
  });

module.exports = router;
