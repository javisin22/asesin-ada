const Pool = require('pg').Pool;
const { Client } = require('pg');
const constants = require('./constants.js');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  max: 3,
});

// const client = new Client({
//   host:  process.env.DB_HOST,
//   user:  process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME
// });

// client.connect();


// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    //console.error(constants.ERROR_DATA_BASE, err);
    return;
  }
  //console.log(constants.CONNECTED_DB);
  done();
});

// Manejo de la señal SIGINT para cerrar correctamente la conexión a la base de datos
process.on('SIGINT', () => {
  pool.end(() => {
    //console.log(constants.DISCONNECTED_DB);
    process.exit(0);
  });
});

module.exports = pool;
// module.exports = client;