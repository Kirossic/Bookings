const {Pool} = require('pg');

const con = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || "postgres",
    port: parseInt(process.env.DB_PORT || '5432', 10),
    password: process.env.DB_PASSWORD || "12345678",
    database: process.env.DB_NAME || "db_bronare"
});

con.connect().then(() => {
    console.log("Connected to the database");
}).catch(err => {
    console.error('Connection error', err.stack);
});

con._connected = true;

module.exports = con;