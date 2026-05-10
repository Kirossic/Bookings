const {Pool} = require('pg');

const con = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || "postgres",
    port: parseInt(process.env.DB_PORT || '5432', 10),
    password: process.env.DB_PASSWORD || "12345678",
    database: process.env.DB_NAME || "db_bronare"
});

// Если удалённая БД (Supabase/Heroku/etc.) требует SSL, укажи
// DB_SSL=true в переменных окружения (Render/CI). В локальной
// разработке можно не устанавливать.
if (process.env.DB_SSL === 'true') {
    // node-postgres принимает опцию `ssl` в конфиге пула
    con.options = con.options || {};
    con.options.ssl = { rejectUnauthorized: false };
}

con.connect().then(() => {
    console.log("Connected to the database");
}).catch(err => {
    console.error('Connection error', err.stack);
});

con._connected = true;

module.exports = con;