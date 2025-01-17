const axios = require("axios");
const { IataIcao } = require("../models"); // Adjust path if needed

// Get ICAO Code and Airport Data
const getJeppesenData = async (req, res) => {
    const { iata } = req.query;

    try {
        // Fetch ICAO code using Sequelize
        const airport = await IataIcao.findOne({
            where: { iata },
        });

        if (!airport) {
            return res.status(404).json({ error: "ICAO code not found." });
        }

        const icaoCode = airport.icao;

        const airportDataResponse = await axios.get(
            `https://ww1.jeppesen.com/icharts/airports-json.jsp`,
            {
                params: {
                    coveragecodes: "EJEPA3,TAHY01,TAHY02",
                    search: icaoCode,
                    user: "azerbaijannav",
                },
            }
        );
        if (airportDataResponse?.status === 200) {
            const chartsData = await getChartsData(icaoCode, airportDataResponse.data.Airports.items[0].airportId);
            res.json(chartsData);

        }
        console.log("res: ", airportDataResponse);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving ICAO data." });
    }
};

// Get Charts Data
const getChartsData = async (icao, airportCode) => {

    try {
        const chartsResponse = await axios.get(
            `https://ww1.jeppesen.com/icharts/charts-json.jsp`,
            {
                params: {
                    user: "azerbaijannav",
                    coveragecodes: "EJEPA3,TAHY01,TAHY02",
                    selectedcoveragecodes: "EJEPA3,TAHY01,TAHY02",
                    icao,
                    "airport-id": airportCode,
                },
            }
        );

        return chartsResponse.data;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving charts data." });
    }
};

// Get Tile Data
const getTileData = async (req, res) => {
    const { docid } = req.query;

    try {
        const tileResponse = await axios.get(
            `https://ww1.jeppesen.com/icharts/tile`,
            {
                params: {
                    docid,
                    x: 0,
                    y: 0,
                    vpwidth: 692,
                    vpheight: 921,
                    twidth: 692,
                    theight: 921,
                    wholechart: true,
                    rotation: 0,
                    zoom: 6,
                },
            }
        );

        const base64Image = Buffer.from(tileResponse.data, 'binary').toString('base64');

        res.json({ image: base64Image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving tile data." });
    }
};

module.exports = {
    getJeppesenData,
    getChartsData,
    getTileData,
};
