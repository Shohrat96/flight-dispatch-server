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


const MOCK_DATA = [
  {
    date: "2024-12-05",
    flight_number: 261,
    aircraft_type: "E190",
    reg_number: "VPBRV",
    origin: "GYD",
    destination: "NAJ",
    ETD: "04:00",
    ETA: "05:20",
    TAF_DEP: "TAF UBBB 201647Z 2018/2118 14006KT 8000 BKN030 TX10/2110Z TN06/2102Z TEMPO 2018/2024 VRB04KT 5000 -RA SCT012 BKN040 TEMPO 2100/2106 16016KT SCT010 BECMG 2106/2108 16012KT SCT025",
    TAF_DEST: "TAF UBBN 201649Z 2018/2118 VRB04KT 8000 SCT050 BKN100 TX09/2112Z TNM05/2103Z TEMPO 2002/2102 04010KT 2000 TEMPO 2102/2107 01010KT 3000 BR BCFG FEW035CB BKN080 BECMG 2001/2109 22008KT 6000 NSW FM210600 27006MPS 6000 BKN016",
    metar_dep: "UBBB 202100Z 15006KT 9999 FEW014 OVC022 09/08 Q1021 NOSIG",
    metar_dest: "UBBN 111100Z 22004KT 4200 BR SCT033 BKN080 04/01 Q1023 NOSIG RMK MT OBSC QFE692",
    isWarning: true
  },
  {
    date: "2024-12-05",
    flight_number: 262,
    aircraft_type: "E190",
    reg_number: "VPBRV",
    origin: "NAJ",
    destination: "GYD",
    ETD: "06:10",
    ETA: "07:20",
    TAF_DEP: "TAF UBBN 201649Z 2018/2118 VRB04KT 8000 SCT050 BKN100 TX09/2112Z TNM05/2103Z TEMPO 2018/2102 04010KT TEMPO 2102/2107 01010KT 3000 BR BCFG FEW035CB BKN080 BECMG 2107/2109 22008KT 6000 NSW",
    TAF_DEST: "TAF UBBB 111055Z 1112/1212 18012KT 9999 SCT030 TX11/1112Z TN07/1202Z TEMPO 1112/1118 21018KT SCT010 BECMG 1118/1120 19016KT TEMPO 1120/1202 22022G32KT SCT010 BECMG 1202/1204 32012KT TEMPO 1206/1212 34018KT",
    metar_dep: "UBBN 202100Z 06002KT 9999 SCT046 BKN100 M01/M04 Q1017 NOSIG RMK QFE688",
    metar_dest: "UBBB 111100Z 19014KT CAVOK 11/07 Q1019 NOSIG",
    isWarning: true
  },
  {
    date: "2024-12-05",
    flight_number: 807,
    aircraft_type: "A320",
    reg_number: "4KAZ80",
    origin: "GYD",
    destination: "VKO",
    ETD: "04:05",
    ETA: "07:30",
    TAF_DEP: "TAF UBBB 201647Z 2018/2118 14006KT 8000 BKN030 TX10/2110Z TN06/2102Z TEMPO 2018/2024 VRB04KT 5000 -RA SCT012 BKN040 TEMPO 2100/2106 16016KT SCT010 BECMG 2106/2108 16012KT SCT025",
    TAF_DEST: "TAF UUWW 111050Z 1112/1212 24005G10MPS 9999 OVC006 TXM02/1115Z TNM05/1206Z TEMPO 1112/1116 2500 -SHSN -FZRA BR BKN003 BKN016CB BECMG 1116/1118 30005MPS BKN012 TEMPO 1118/1212 32008G13MPS 2000 SHSN BLSN BKN005 BKN016CB",
    metar_dep: "UBBB 202100Z 15006KT 9999 FEW014 OVC022 09/08 Q1021 NOSIG",
    metar_dest: "UUWW 111100Z 26007MPS 9999 OVC005 M05/M06 Q1013 R24/510350 TEMPO -FZRA",
    isWarning: false
  }
]

// Load environment variables
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
  // origin: 'https://azaldispatch.netlify.app'
}))

app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('server launched successfully')
})

initWebSocketServer()
// Flight routes
app.use('/api/flights', flightRoutes);
app.use('/api/jeppesen', jeppesenRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/remarks', remarkRoutes);



// Endpoint to restart WebSocket server
app.post('/api/restart-websocket', (req, res) => {
  try {
    initWebSocketServer();
    res.status(200).send({ message: 'WebSocket server restarted successfully' });
  } catch (err) {
    console.error('Error restarting WebSocket server:', err);
    res.status(500).send({ message: 'Failed to restart WebSocket server', error: err.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // await syncDatabase()
});
