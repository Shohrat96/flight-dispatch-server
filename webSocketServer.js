const WebSocket = require('ws');
const cron = require('node-cron');
const { IataIcao, WeatherData, Flight } = require('./models');
const dayjs = require('dayjs');
const { checkVisibilityWarning } = require('./utils/checkVisibilityWarning');
const { saveWeatherData } = require('./services/saveWeatherData');
const { getIataIcaoMapping } = require('./services/convertIatatoIcaoService');
const { processTafRequest } = require('./controllers/getWeatherTafController');
const { supabase } = require('./config/supabaseClient');

let wss = null; // Store WebSocket server instance
let cronJob = null; // Store cron job instance

function initWebSocketServer() {
  // Cleanup existing resources before reinitializing
  if (wss) {
    wss.clients.forEach((client) => client.close());
    wss.close();
    wss = null;
  }
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }

  // Initialize WebSocket server
  wss = new WebSocket.Server({ port: 8081 });
  const clients = new Set();

  wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });
  });

  const broadcast = (data) => {
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    }
  };

  cronJob = cron.schedule('0 * * * * *', async () => {
    const flightsWithWeather = await getFlightsForCron();
    broadcast(flightsWithWeather);
  });

  async function getFlightsForCron() {
    // Fetch flights
    try {
      const { data: flights, error: flightsError } = await supabase
        .from("flight_list_shift")
        .select("*");

      if (flightsError) throw new Error(flightsError.message);
      const icaoMapping = await getIataIcaoMapping();
      const weatherData = await processTafRequest(icaoMapping);
      await saveWeatherData(weatherData);
      const flightsWithWeather = await Promise.all(
        flights.map(async (item) => {
          // Get ICAO code for origin using the iata_icao table
          const { data: originIcao, error: originError } = await supabase
            .from("airports")
            .select("icao")
            .eq("iata", item.origin)
            .maybeSingle();;

          // Get ICAO code for destination using the iata_icao table
          const { data: destIcao, error: destError } = await supabase
            .from("airports")
            .select("icao")
            .eq("iata", item.destination)
            .maybeSingle();

          if (originError) console.error("Origin ICAO fetch error:", originError);
          if (destError) console.error("Destination ICAO fetch error:", destError);

          const originIcaoCode = originIcao ? originIcao.icao : "";
          const destIcaoCode = destIcao ? destIcao.icao : "";

          // Fetch weather data for departure (origin)
          const { data: weatherDataDep, error: weatherDepError } = await supabase
            .from("weather_data")
            .select("*")
            .eq("icao_code", originIcaoCode)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Fetch weather data for destination
          const { data: weatherDataDest, error: weatherDestError } = await supabase
            .from("weather_data")
            .select("*")
            .eq("icao_code", destIcaoCode)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (weatherDepError) console.error("Weather dep fetch error:", weatherDepError);
          if (weatherDestError) console.error("Weather dest fetch error:", weatherDestError);

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
            TAF_DEP: weatherDataDep ? weatherDataDep.taf : null,
            TAF_DEST: weatherDataDest ? weatherDataDest.taf : null,
            metar_dep: weatherDataDep ? weatherDataDep.metar : null,
            metar_dest: weatherDataDest ? weatherDataDest.metar : null,
            isWarning,
          };
        })
      );
      return flightsWithWeather;
    } catch (error) {
      console.error("Error fetching flights in websocket:", error.message);
      res.status(500).json({ error: error.message });
    }

    // const flights = await Flight.findAll();
    // const icaoMapping = await getIataIcaoMapping();
    // const weatherData = await processTafRequest(icaoMapping);
    // await saveWeatherData(weatherData);
    // const flightsWithWeather = await Promise.all(
    //   flights.map(async (item) => {
    //     const originIcao = await IataIcao.findOne({ where: { iata: item.origin } });
    //     const destIcao = await IataIcao.findOne({ where: { iata: item.destination } });
    //     const originIcaoCode = originIcao ? originIcao.icao : '';
    //     const destIcaoCode = destIcao ? destIcao.icao : '';
    //     const weatherDataDep = originIcaoCode
    //       ? await WeatherData.findOne({ where: { icao_code: originIcaoCode }, order: [['updated_at', 'DESC']] })
    //       : null;
    //     const weatherDataDest = destIcaoCode
    //       ? await WeatherData.findOne({ where: { icao_code: destIcaoCode }, order: [['updated_at', 'DESC']] })
    //       : null;
    //     const isWarning = checkVisibilityWarning(weatherDataDest?.taf, item.ETA, item);

    //     return {
    //       date: item.date,
    //       flight_number: item.flight_number,
    //       aircraft_type: item.aircraft_type,
    //       reg_number: item.reg_number,
    //       origin: item.origin,
    //       destination: item.destination,
    //       ETD: dayjs(item.ETD).format('HH:mm'),
    //       ETA: dayjs(item.ETA).format('HH:mm'),
    //       TAF_DEP: weatherDataDep ? weatherDataDep?.taf : null,
    //       TAF_DEST: weatherDataDest ? weatherDataDest?.taf : null,
    //       metar_dep: weatherDataDep ? weatherDataDep?.metar : null,
    //       metar_dest: weatherDataDest ? weatherDataDest?.metar : null,
    //       isWarning,
    //     };
    //   })
    // );

    // return flightsWithWeather;
  }

  console.log('WebSocket server initialized');
}

module.exports = initWebSocketServer;
