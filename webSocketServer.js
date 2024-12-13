// websocket.js
const WebSocket = require('ws');
const cron = require('node-cron');
const { IataIcao, WeatherData, Flight } = require('./models'); // Adjust this import as needed

function initWebSocketServer() {
  // Initialize WebSocket server
  const wss = new WebSocket.Server({ port: 8081 });

  // Keep track of connected clients
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

  // Cron job to run getFlights and broadcast updates
  console.log('WebSocket script is running');

  cron.schedule('*/5 * * * *', async () => { // Run every minute (or adjust as needed)
    console.log('Fetching flights data...');
    const flightsWithWeather = await getFlightsForCron();
    broadcast(flightsWithWeather);
  });

  async function getFlightsForCron() {
    const flights = await Flight.findAll();

    const flightsWithWeather = await Promise.all(
      flights.map(async (item) => {
        const originIcao = await IataIcao.findOne({ where: { iata: item.origin } });
        const destIcao = await IataIcao.findOne({ where: { iata: item.destination } });

        const originIcaoCode = originIcao ? originIcao.icao : '';
        const destIcaoCode = destIcao ? destIcao.icao : '';

        const weatherDataDep = originIcaoCode
          ? await WeatherData.findOne({ where: { icao_code: originIcaoCode }, order: [['updated_at', 'DESC']] })
          : null;

        const weatherDataDest = destIcaoCode
          ? await WeatherData.findOne({ where: { icao_code: destIcaoCode }, order: [['updated_at', 'DESC']] })
          : null;

        return {
          date: item.date,
          flight_number: item.flight_number,
          aircraft_type: item.aircraft_type,
          reg_number: item.reg_number,
          origin: item.origin,
          destination: item.destination,
          ETD: item.ETD,
          ETA: item.ETA,
          TAF_DEP: weatherDataDep ? weatherDataDep?.taf : null,
          TAF_DEST: weatherDataDest ? weatherDataDest?.taf : null,
          metar_dep: weatherDataDep ? weatherDataDep?.metar : null,
          metar_dest: weatherDataDest ? weatherDataDest?.metar : null,
        };
      })
    );

    return flightsWithWeather;
  }

  console.log('WebSocket server initialized');
}

module.exports = initWebSocketServer;
