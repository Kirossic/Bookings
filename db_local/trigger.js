const con = require('./db.js');
const triggerUsers = `
CREATE OR REPLACE FUNCTION log_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logs (user_id, action, details, created_at)
    VALUES (OLD.id, 'DELETE', 'User deleted', NOW());
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS user_deletion_trigger ON users;

CREATE TRIGGER user_deletion_trigger
AFTER DELETE ON users
FOR EACH ROW
EXECUTE PROCEDURE log_user_deletion();
`;

const triggerBookings = `
CREATE OR REPLACE FUNCTION log_booking_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logs (user_id, action, details, created_at)
    VALUES (OLD.id, 'DELETE', 'Booking deleted', NOW());
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS booking_deletion_logs (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER,
    deleted_at TIMESTAMP
);

DROP TRIGGER IF EXISTS booking_deletion_trigger ON bookings;

CREATE TRIGGER booking_deletion_trigger
AFTER DELETE ON bookings
FOR EACH ROW
EXECUTE PROCEDURE log_booking_deletion();
`;

async function createTrigger() {
    try {
        await con.query(triggerUsers);
        await con.query(triggerBookings);
        console.log('Триггер для логирования создан успешно.');
    } catch (error) {
        console.error('Ошибка при создании триггера:', error);
    }
}

async function deleteTriggers() {
    try {
        await con.query('DROP TRIGGER IF EXISTS user_deletion_trigger ON users;');
        await con.query('DROP FUNCTION IF EXISTS log_user_deletion();');
        await con.query('DROP TABLE IF EXISTS user_deletion_logs;');

        await con.query('DROP TRIGGER IF EXISTS booking_deletion_trigger ON bookings;');
        await con.query('DROP FUNCTION IF EXISTS log_booking_deletion();');
        await con.query('DROP TABLE IF EXISTS booking_deletion_logs;');

        console.log('Триггеры и связанные объекты удалены успешно.');
    } catch (error) {
        console.error('Ошибка при удалении триггеров:', error);
    }
}

module.exports = { createTrigger, deleteTriggers };