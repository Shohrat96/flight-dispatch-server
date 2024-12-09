// services/aviationApiService.js
const axios = require('axios');

/**
 * Fetches TAF data from the aviation weather API.
 * @param {string} icaoCodes - Comma-separated ICAO codes.
 * @returns {Object} - Parsed JSON response from the API.
 */
async function fetchTafData(icaoCodes) {
    const apiUrl = `https://aviationweather.gov/api/data/taf?ids=${icaoCodes}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: { Accept: 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching TAF data:', error.message);
        throw error;
    }
}

module.exports = { fetchTafData };
