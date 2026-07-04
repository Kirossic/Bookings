require('dotenv').config();
const { Pool } = require('pg');

const con = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'db_bronare',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

con
  .connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Connection error', err.stack);
  });

con._connected = true;

module.exports = con;
