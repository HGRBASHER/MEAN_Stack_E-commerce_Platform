const NodeCache = require('node-cache');

const stdTTL = 5 * 60; 
const checkperiod = 2 * 60; 
const cache = new NodeCache({ stdTTL, checkperiod });

module.exports = cache;
