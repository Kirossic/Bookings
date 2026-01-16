const con = require('./db.js');
const {createTrigger, deleteTriggers} = require('./trigger.js');

async function migrate() {
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
                user_id INTEGER REFERENCES users(id),
                action VARCHAR(100),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await deleteTriggers();
        // await createTrigger();

        console.log('Миграции успешно применены!');
        process.exit(0);
    } catch (err) {
        console.error('Ошибка миграции:', err);
        process.exit(1);
    }
}

migrate();