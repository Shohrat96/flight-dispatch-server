// controllers/aviationController.js
const { extractIcaoCodes } = require('../utils/mappingUtils');
const { fetchTafData } = require('../services/getWeatherTafService');

/**
 * Processes mapping and fetches TAF data for corresponding ICAO codes.
 * @param {Array} mapping - Array of mappings with `iata_code` and `icao_code`.
 */
async function processTafRequest(mapping) {
    try {
        const icaoCodes = extractIcaoCodes(mapping);

        const tafData = await fetchTafData(icaoCodes);

        return tafData;
    } catch (error) {
        console.error('Error processing TAF request:', error);
        throw error;
    }
}

module.exports = { processTafRequest };
