// utils/mappingUtils.js

/**
 * Extracts ICAO codes from the mapping and constructs a comma-separated string.
 * @param {Array} mapping - Array of objects with `icao_code`.
 * @returns {string} - Comma-separated ICAO codes (e.g., "UBBN,UBBB,UBBG").
 */
function extractIcaoCodes(mapping) {
    return mapping.map(entry => entry.icao_code).join(',');
}

module.exports = { extractIcaoCodes };
