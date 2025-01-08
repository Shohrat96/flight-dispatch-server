const pool = require('../db/db');
const dayjs = require("dayjs");
const { Flight, WeatherData, IataIcao } = require('../models');
const { getIataIcaoMapping } = require('../services/convertIatatoIcaoService');
const sendEmail = require('../services/emailService');
const { saveWeatherData } = require('../services/saveWeatherData');
const { processTafRequest } = require('./getWeatherTafController');
const { checkVisibilityWarning } = require('../utils/checkVisibilityWarning');



const getFlights = async (req, res) => {

  const flights = await Flight.findAll();
  const icaoMapping = await getIataIcaoMapping()
  const weatherData = await processTafRequest(icaoMapping)
  await saveWeatherData(weatherData)

  const flightsWithWeather = await Promise.all(
    flights.map(async (item) => {
      // Get ICAO code for origin using the IataIcao table
      const originIcao = await IataIcao.findOne({
        where: { iata: item.origin },
      });

      // Get ICAO code for destination using the IataIcao table
      const destIcao = await IataIcao.findOne({
        where: { iata: item.destination },
      });

      // Use a default value (empty string) if ICAO code is not found
      const originIcaoCode = originIcao ? originIcao.icao : '';
      const destIcaoCode = destIcao ? destIcao.icao : '';

      // Fetch weather data for departure (origin) using the ICAO code
      const weatherDataDep = originIcaoCode
        ? await WeatherData.findOne({ where: { icao_code: originIcaoCode }, order: [['updated_at', 'DESC']] })
        : null;

      const weatherDataDest = destIcaoCode
        ? await WeatherData.findOne({ where: { icao_code: destIcaoCode }, order: [['updated_at', 'DESC']] })
        : null;

      const isWarning = checkVisibilityWarning(weatherDataDest?.taf, item.ETA);

      return {
        date: item.date,
        flight_number: item.flight_number,
        aircraft_type: item.aircraft_type,
        reg_number: item.reg_number,
        origin: item.origin,
        destination: item.destination,
        ETD: dayjs(item.ETD).format("HH:mm"),
        ETA: dayjs(item.ETA).format("HH:mm"),
        TAF_DEP: weatherDataDep ? weatherDataDep?.taf : null,
        TAF_DEST: weatherDataDest ? weatherDataDest?.taf : null,
        metar_dep: weatherDataDep ? weatherDataDep?.metar : null,
        metar_dest: weatherDataDest ? weatherDataDest?.metar : null,
        isWarning
      };
    })
  );
  res.status(200).json(flightsWithWeather)
};

// Function to map and insert data into the Flight table
const mapAndInsertFlights = async (rawData) => {
  const mappedData = rawData.map(item => {
    return {
      date: new Date(item.date),
      flight_number: parseInt(item.flight_number), // Ensure flight_number is an integer
      aircraft_type: item.aircraft_type,
      reg_number: item.reg_number,
      origin: item.origin,
      destination: item.destination,
      ETD: new Date(`${item.date}T${item.ETD}:00`), // Combine date and etd and convert to Date object
      ETA: new Date(`${item.date}T${item.ETA}:00`), // Combine date and eta and convert to Date object
    };
  });

  try {
    await Flight.truncate()
    const flightList = await Flight.bulkCreate(mappedData, {
      validate: true, // Optional, validates data before insertion
    });
    const icaoMapping = await getIataIcaoMapping()

    const weatherData = await processTafRequest(icaoMapping)
    await saveWeatherData(weatherData)

    return icaoMapping
  } catch (error) {
    console.error('Error in getIataIcaoMapping:', error);
  }
};

exports.mapAndInsertFlights = mapAndInsertFlights

exports.checkWeatherAndSendAlerts = async () => {
  try {
    const result = await pool.query('SELECT * FROM flights');
    const flights = result.rows;

    flights.forEach(async (flight) => {
      const { flight_number, ceiling, visibility, ceiling_min, visibility_min } = flight;

      if (ceiling < ceiling_min || visibility < visibility_min) {
        await sendEmail(
          'dispatcher@example.com',
          `Weather Alert for Flight ${flight_number}`,
          `Flight ${flight_number} has weather conditions below the minimums.`
        );
      }
    });
  } catch (error) {
    console.error('Error checking weather:', error);
  }
};

exports.getFlights = getFlights