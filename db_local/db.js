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

// Функция для создания таблицы users
async function createUsersTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await con.query(query);
        console.log('Таблица users создана или уже существует');
    } catch (err) {
        console.error('Ошибка при создании таблицы users', err);
    }
}
createUsersTable();

module.exports = con;