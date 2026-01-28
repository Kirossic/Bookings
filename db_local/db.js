const {Client} = require('pg');

const con = new Client({
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

// Удаление дублей: оставить минимальный id для каждой пары user_id, resource_id
con.query(`
    DELETE FROM bookings
    WHERE id NOT IN (
        SELECT min_id FROM (
            SELECT MIN(id) as min_id
            FROM bookings
            GROUP BY user_id, resource_id
        ) AS keep
    )
`)
  .then(() => {
    console.log('Duplicate bookings removed');
  })
  .catch(err => {
    console.error('Error removing duplicate bookings', err);
  });

con._connected = true;

module.exports = con;