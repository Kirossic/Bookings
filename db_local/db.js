const {Client} = require('pg');

const con = new Client({
    host: process.env.DB_HOST || 'localhost',
    user: "postgres",
    port: 5432,
    password: "12345678",
    database: "db_bronare"
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