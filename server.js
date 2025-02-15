const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const flightRoutes = require('./routes/flightRoutes');
const jeppesenRoutes = require('./routes/jepessenRoutes');
const loginRoutes = require('./routes/authRoutes');

const { syncDatabase } = require('./models');
const initWebSocketServer = require('./webSocketServer');
const checklistRoutes = require('./routes/checklistRoutes');
const remarkRoutes = require('./routes/remarkRoutes');
const { supabase } = require('./config/supabaseClient');

dotenv.config();

const app = express();

// Set up middleware
app.use(cors({ origin: 'https://azaldispatch.netlify.app' }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server launched successfully');
});

// Flight routes
app.use('/api/flights', flightRoutes);
app.use('/api/jeppesen', jeppesenRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/remarks', remarkRoutes);

const server = app.listen(10000, async () => {
  console.log('Server running on port 10000');
  // Initialize WebSocket server on the same HTTP server
  initWebSocketServer(server);
});

// Endpoint to restart WebSocket server
app.post('/api/restart-websocket', (req, res) => {
  try {
    initWebSocketServer(server);
    res.status(200).send({ message: 'WebSocket server restarted successfully' });
  } catch (err) {
    console.error('Error restarting WebSocket server:', err);
    res.status(500).send({ message: 'Failed to restart WebSocket server', error: err.message });
  }
});
