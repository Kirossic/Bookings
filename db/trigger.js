const con = require('./db.js');

const triggerUsers = `
CREATE OR REPLACE FUNCTION log_user()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'DELETE', 'User deleted. user_id=' || OLD.id, NOW());
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NEW.id, 'INSERT', 'User created', NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NEW.id, 'UPDATE', 'User updated', NOW());
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_trigger ON users;

CREATE TRIGGER user_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION log_user();
`;

const triggerBookings = `
CREATE OR REPLACE FUNCTION log_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (OLD.user_id, 'DELETE', 'Booking deleted. booking_id=' || OLD.id, NOW());
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NEW.user_id, 'INSERT', 'Booking created', NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NEW.user_id, 'UPDATE', 'Booking updated', NOW());
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_trigger ON bookings;

CREATE TRIGGER booking_trigger
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION log_booking();
`;

const triggerResources = `
CREATE OR REPLACE FUNCTION log_resources()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'DELETE', 'Resource deleted. resource_id=' || OLD.id, NOW());
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'INSERT', 'Resource created. resource_id=' || NEW.id, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'UPDATE', 'Resource updated. resource_id=' || NEW.id, NOW());
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resources_trigger ON resources;

CREATE TRIGGER resources_trigger
AFTER INSERT OR UPDATE OR DELETE ON resources
FOR EACH ROW
EXECUTE FUNCTION log_resources()
`;

const triggerPayments = `
CREATE OR REPLACE FUNCTION log_payments()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'DELETE', 'Payment deleted. payment_id=' || OLD.id, NOW());
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'INSERT', 'Payment created. payment_id=' || NEW.id, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'UPDATE', 'Payment updated. payment_id=' || NEW.id, NOW());
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payments_trigger ON payments;

CREATE TRIGGER payments_trigger
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION log_payments()
`;

const triggerRoles = `
CREATE OR REPLACE FUNCTION log_roles()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'DELETE', 'Role deleted. role_id=' || OLD.id, NOW());
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'INSERT', 'Role created. role_id=' || NEW.id, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (NULL, 'UPDATE', 'Role updated. role_id=' || NEW.id, NOW());
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roles_trigger ON roles;

CREATE TRIGGER roles_trigger
AFTER INSERT OR UPDATE OR DELETE ON roles
FOR EACH ROW
EXECUTE FUNCTION log_roles()
`;

// const triggerLogs = ``;


async function createTrigger() {
    try {
        await con.query(triggerUsers);
        await con.query(triggerBookings);
        await con.query(triggerResources);
        await con.query(triggerPayments);
        await con.query(triggerRoles);

        console.log('Триггер для логирования создан успешно.');
    } catch (error) {
        console.error('Ошибка при создании триггера:', error);
    }
}

async function deleteTriggers() {
    try {
        // Удаляем триггер и функцию для users
        await con.query('DROP TRIGGER IF EXISTS user_trigger ON users;');
        await con.query('DROP FUNCTION IF EXISTS log_user();');

        // Удаляем триггер и функцию для bookings
        await con.query('DROP TRIGGER IF EXISTS booking_trigger ON bookings;');
        await con.query('DROP FUNCTION IF EXISTS log_booking();');

        // Удаляем триггер и функцию для resources
        await con.query('DROP TRIGGER IF EXISTS resources_trigger ON resources;');
        await con.query('DROP FUNCTION IF EXISTS log_resources();');

        // Удаляем триггер и функцию для payments
        await con.query('DROP TRIGGER IF EXISTS payments_trigger ON payments;');
        await con.query('DROP FUNCTION IF EXISTS log_payments();');

        // Удаляем триггер и функцию для roles
        await con.query('DROP TRIGGER IF EXISTS roles_trigger ON roles;');
        await con.query('DROP FUNCTION IF EXISTS log_roles();');

        console.log('Триггеры и связанные объекты удалены успешно.');
    } catch (error) {
        console.error('Ошибка при удалении триггеров:', error);
    }
}

module.exports = { createTrigger, deleteTriggers };