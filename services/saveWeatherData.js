const WeatherData = require('../models/WeatherData'); // Adjust the path to your model

/**
 * Saves TAF data into the database using the WeatherData model.
 * @param {Array} tafData - Array of TAF data objects from the API response.
 */
async function saveWeatherData(tafData) {
  try {
    // Transform the API response into the format required by the WeatherData model
    const weatherDataEntries = tafData.map(entry => ({
      icao_code: entry.icaoId,
      taf: entry.rawTAF,
      metar: entry.rawOb, // Assuming METAR is not provided in the current API response
      updated_at: new Date(entry.bulletinTime), // Using bulletinTime as the updated timestamp
    }));

    // Save data to the database
    await WeatherData.bulkCreate(weatherDataEntries, {
      updateOnDuplicate: ['taf','metar', 'updated_at'], // Update TAF and timestamp if the entry already exists
    });

  } catch (error) {
    console.error('Error saving weather data:', error.message);
    throw error;
  }
}

module.exports = { saveWeatherData };
