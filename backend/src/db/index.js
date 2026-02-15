const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool({
  ...config.mysql,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  supportBigNumbers: true,
  bigNumberStrings: true,
});

module.exports = {
  query: (query, params = []) => pool.execute(query, params),
  pool,
};
