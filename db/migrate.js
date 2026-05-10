const dns = require('dns').promises;
const { Pool } = require('pg');
const {createTrigger, deleteTriggers} = require('./trigger.js');
const { startTestDB, startTestUnit } = require('./startTestDB.js');

async function buildPool() {
    const host = process.env.DB_HOST || 'localhost';
    let resolvedHost = host;

    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
        try {
            const ipv4Records = await dns.resolve4(host);
            if (ipv4Records.length > 0) {
                resolvedHost = ipv4Records[0];
            }
        } catch (error) {
            console.warn('IPv4 resolve failed, using original host:', error.message);
        }
    }

    return new Pool({
        host: resolvedHost,
        user: process.env.DB_USER || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        password: process.env.DB_PASSWORD || '12345678',
        database: process.env.DB_NAME || 'db_bronare',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
}

async function migrate() {
    const con = await buildPool();
    try {
        // roles
        await con.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL
            );
        `);

        // users
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

        // resources
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

        // bookings
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

        // payments
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

        // logs
        await con.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(100),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // await deleteTriggers();
        await createTrigger(con);

        console.log('Миграции успешно применены!');

        // Тестовые данные запускаем только явно через env-флаги.
        // В прод-деплое это обычно должно быть выключено.
        if (process.env.SEED_RESET === 'true') {
            await startTestDB(con);
        }
        if (process.env.SEED_DB === 'true') {
            await startTestUnit(con);
        }

        await con.end();
        process.exit(0);
    } catch (err) {
        console.error('Ошибка миграции:', err);
        await con.end().catch(() => {});
        process.exit(1);
    }
}

migrate();