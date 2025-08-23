const {Client} = require('pg');

const con = new Client({
    host: process.env.DB_HOST || 'localhost',
    user: "postgres",
    port: 5432,
    password: "m080603m",
    database: "db_bronare"
});
con.connect().then(() => {
    console.log("Connected to the database");
}).catch(err => {
    console.error('Connection error', err.stack);
});

module.exports = con;