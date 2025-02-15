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

function initWebSocketServer(httpServer) {
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

  // Initialize WebSocket server on the same HTTP server
  wss = new WebSocket.Server({ server: httpServer });

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
    // Fetch flights and weather data as in your previous logic
    // This is unchanged
  }
}

module.exports = initWebSocketServer;
