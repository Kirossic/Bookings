const { hashPassword } = require('../backend/hashing.js');

async function startTestDB(con) {
    try {
        // Очищаем базу данных
        await con.query(`DROP TABLE IF EXISTS payments CASCADE;`);
        await con.query(`DROP TABLE IF EXISTS bookings CASCADE;`);
        await con.query(`DROP TABLE IF EXISTS logs CASCADE;`);
        await con.query(`DROP TABLE IF EXISTS resources CASCADE;`);
        await con.query(`DROP TABLE IF EXISTS users CASCADE;`);
        await con.query(`DROP TABLE IF EXISTS roles CASCADE;`);
        await con.query(`DROP TABLE IF EXISTS booking_deletion_logs CASCADE;`);

        // Пересоздаем таблицы
        await con.query(`
            CREATE TABLE roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL
            );
        `);

        await con.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role_id INTEGER REFERENCES roles(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await con.query(`
            CREATE TABLE resources (
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
            CREATE TABLE bookings (
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
            CREATE TABLE payments (
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
            CREATE TABLE logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                action VARCHAR(255),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Тестовая база данных и таблицы созданы успешно.');
    } catch (error) {
        console.error('Ошибка при создании тестовой базы данных:', error);
    }
}

async function startTestUnit(con) {
    try {
        await con.query(`
            INSERT INTO roles (name) VALUES
            ('user'),
            ('manager'),
            ('admin')
            ON CONFLICT (name) DO NOTHING;
        `);

        // Хешировать пароли перед вставкой
        const adminHash = await hashPassword('admin');
        const managerHash = await hashPassword('manager');
        const user1Hash = await hashPassword('user1');
        const user2Hash = await hashPassword('user2');
        const user3Hash = await hashPassword('user3');

        await con.query(`
            INSERT INTO users (name, email, password_hash, role_id) VALUES
            ('admin', 'admin', $1, (SELECT id FROM roles WHERE name = 'admin')),
            ('manager', 'manager', $2, (SELECT id FROM roles WHERE name = 'manager')),
            ('user1', 'user1', $3, (SELECT id FROM roles WHERE name = 'user')),
            ('user2', 'user2', $4, (SELECT id FROM roles WHERE name = 'user')),
            ('user3', 'user3', $5, (SELECT id FROM roles WHERE name = 'user'))
            ON CONFLICT (email) DO NOTHING;
        `, [adminHash, managerHash, user1Hash, user2Hash, user3Hash]);

        await con.query(`
            INSERT INTO resources (name, type, description, price_per_hour, status) VALUES
            ('Отель звезда', 'hotel', 'hotel', 50.00, 'Свободен'),
            ('Test', 'Test', 'Test description', 20.00, 'Свободен'),
            ('Laptop L15', 'equipment', 'Powerful laptop for presentations', 30.00, 'Свободен'),
            ('Projector X200', 'equipment', 'High-resolution projector', 25.00, 'Свободен'),
            ('Conference Room A', 'room', 'Spacious conference room with AV setup', 100.00, 'Свободен'),
            ('Meeting Room B', 'room', 'Cozy meeting room for small teams', 75.00, 'Свободен'),
            ('Workstation 1', 'workspace', 'Ergonomic workstation with dual monitors', 40.00, 'Свободен'),
            ('Workstation 2', 'workspace', 'Quiet workspace with natural lighting', 35.00, 'Свободен')
            ON CONFLICT DO NOTHING;
        `);

        console.log('Тестовые таблицы созданы успешно.');
        
    } catch (error) {
        console.error('Ошибка при создании тестовых данных:', error);
    }
}

module.exports = { startTestDB, startTestUnit };