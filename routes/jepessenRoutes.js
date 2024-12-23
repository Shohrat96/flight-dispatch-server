const express = require('express');
const { getJeppesenData, getChartsData, getTileData } = require('../controllers/jepessenController');  // Corrected import

const router = express.Router();

// Get ICAO Code and Airport Data
router.get('/icao', getJeppesenData);

// Get Charts Data
router.get('/charts', getChartsData);

// Get Tile Data
router.get('/tile', getTileData);

module.exports = router;
