const express = require('express');
const path = require('path');
const app = require('./api.js');
const con = require('../../db/db.js');
const { createTrigger } = require('../../db/trigger.js');
const { startTestUnit } = require('../../db/startTestDB.js');

const publicDir = path.resolve(__dirname, '../../public');

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Инициализация БД при старте сервера
async function initializeDatabase() {
    try {
        console.log('Инициализация БД...');

        // Создание таблиц IF NOT EXISTS
        await con.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL
            );
        `);

        await con.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role_id INTEGER REFERENCES roles(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await con.query(`
            CREATE TABLE IF NOT EXISTS resources (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50),
                description TEXT,
                price_per_hour NUMERIC(10,2),
                status VARCHAR(30),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await con.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                resource_id INTEGER REFERENCES resources(id),
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                status VARCHAR(30),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await con.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                booking_id INTEGER REFERENCES bookings(id),
                amount NUMERIC(10,2),
                status VARCHAR(30),
                payment_method VARCHAR(30),
                transaction_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await con.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(100),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Создание триггеров
        await createTrigger(con);
        console.log('✓ Таблицы и триггеры созданы/проверены');

        // Создание тестовых данных (admin, manager, user1, user2, user3)
        await startTestUnit(con);
        console.log('✓ Тестовые пользователи и ресурсы готовы');

        console.log('✓ Инициализация БД успешна!');
    } catch (error) {
        console.error('⚠️ Ошибка инициализации БД:', error.message);
        // Не прерываем запуск сервера — может быть просто БД недоступна
    }
}

const PORT = process.env.PORT || 3000;

// Инициализируем БД, затем запускаем сервер
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
        console.log('|_______________________|_________________________________________________|');
        console.log(`|Стартовая страница:    |http://localhost:${PORT}/index                      |`);
        console.log('|-----------------------|-------------------------------------------------|');
        console.log(`|Главная страница:      |http://localhost:${PORT}/Buking/home/index.html     |`);
        console.log('|-----------------------|-------------------------------------------------|');
        console.log(`|sign_in:               |http://localhost:${PORT}/Buking/sign_in/index.html  |`);
        console.log('|-----------------------|-------------------------------------------------|');
        console.log(`|Админ понель:          |http://localhost:${PORT}/admin/admin.html           |`);
        console.log('|_______________________|_________________________________________________|');
    });
}).catch(error => {
    console.error('Критическая ошибка при запуске:', error);
    process.exit(1);
});

app.use(express.static(publicDir));