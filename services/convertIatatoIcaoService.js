const { Flight, IataIcao } = require('../models');  // Import your models
const { Op } = require('sequelize');
const sequelize = require('../config/database');



async function getIataIcaoMapping() {
    try {
  
      // Step 1: Get unique origin IATA codes
      const uniqueOrigins = await Flight.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('origin')), 'origin']],
        where: { origin: { [Op.ne]: null } },
        raw: true, // Return plain objects instead of Sequelize models
      });
  
      // Step 2: Get unique destination IATA codes
      const uniqueDestinations = await Flight.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('destination')), 'destination']],
        where: { destination: { [Op.ne]: null } },
        raw: true,
      });
  
      // Step 3: Combine origin and destination IATA codes into a Set for uniqueness
      const iataCodes = new Set([
        ...uniqueOrigins.map(item => item.origin),
        ...uniqueDestinations.map(item => item.destination),
      ]);
  
      // Step 4: Fetch ICAO codes for the IATA codes
      const iataIcaoMapping = await IataIcao.findAll({
        where: {
          iata: {
            [Op.in]: Array.from(iataCodes),
          },
        },
        attributes: ['iata', 'icao'],
      });
      
      // Step 5: Create a mapping from IATA to ICAO
      const mapping = iataIcaoMapping.map(record => ({
        iata_code: record.iata,
        icao_code: record.icao,
      }));
  
      return mapping;
  
    } catch (error) {
      console.error('Error fetching IATA to ICAO mapping:', error);
      throw error;
    }
  }
  

module.exports = {
  getIataIcaoMapping,
};
