const WeatherData = require('../models/WeatherData'); // Adjust the path to your model

/**
 * Saves TAF data into the database using the WeatherData model.
 * @param {Array} tafData - Array of TAF data objects from the API response.
 */
async function saveWeatherData(tafData) {
  try {
    // Retrieve all bulletinTime values currently in the database for the given ICAO codes
    const icaoCodes = tafData.map(entry => entry.icaoId);
    const existingEntries = await WeatherData.findAll({
      where: {
        icao_code: icaoCodes,
      },
      attributes: ['icao_code', 'updated_at'], // Only fetch the required fields
    });

    // Create a Set of existing ICAO codes and bulletinTime combinations
    const existingDataSet = new Set(
      existingEntries.map(entry => `${entry.icao_code}_${entry.updated_at.toISOString()}`)
    );

    // Filter out duplicate data from tafData based on bulletinTime
    const uniqueWeatherDataEntries = tafData.filter(entry => {
      const entryKey = `${entry.icaoId}_${new Date(entry.bulletinTime).toISOString()}`;
      if (existingDataSet.has(entryKey)) {
        return false; // Skip if it already exists
      }
      existingDataSet.add(entryKey); // Add to the set if it's new
      return true;
    });

    // Transform the filtered data into the format required by the WeatherData model
    const weatherDataEntries = uniqueWeatherDataEntries.map(entry => ({
      icao_code: entry.icaoId,
      taf: entry.rawTAF,
      metar: entry.rawOb, // Assuming METAR is not provided in the current API response
      updated_at: new Date(entry.bulletinTime), // Using bulletinTime as the updated timestamp
    }));

    // Save unique data to the database
    if (weatherDataEntries.length > 0) {
      await WeatherData.bulkCreate(weatherDataEntries, {
        updateOnDuplicate: ['taf', 'metar', 'updated_at'], // Update TAF and timestamp if the entry already exists
      });
      console.log(`Saved ${weatherDataEntries.length} new weather data entries.`);
    } else {
      console.log('No new weather data to save.');
    }
  } catch (error) {
    console.error('Error saving weather data:', error.message);
    throw error;
  }
}


module.exports = { saveWeatherData };
