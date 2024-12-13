const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const flightRoutes = require('./routes/flightRoutes');
const { syncDatabase } = require('./models');
const initWebSocketServer = require('./webSocketServer');

// Load environment variables
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}))

app.use(bodyParser.json());


app.get('/', (req, res) => {
   res.send('server launched successfully')
})

initWebSocketServer()
// Flight routes
app.use('/api/flights', flightRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await syncDatabase()
});
