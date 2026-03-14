const express = require('express');
const app = express();
app.use(express.json());
const con = require('./db/db.js');
const jwt = require('jsonwebtoken');
const verifyToken = require('./backend/Verify_Token.js');
const { comparePassword } = require('./backend/hashing.js');
const { validateRegister, validateResource, validateBooking } = require('./middleware/validators');
const { errorHandler, ApiError } = require('./middleware/errorHandler.js');
const { buildRead, buildUpdate, buildDelete } = require('./backend/api_constructor.js');


app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, 'Заполните все поля');
    }
    try {
        const result = await con.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) {
            throw new ApiError(401, 'Неверный email или пароль');
        }
        const user = result.rows[0];

        const ok = await comparePassword(password, user.password_hash);
        if (!ok) {
            throw new ApiError(401, 'Неверный email или пароль');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id },
            process.env.JWT_SECRET || '789456123',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role_id: user.role_id } });
    } catch (error) {
        console.error('Ошибка при входе пользователя', error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.get('/api/users', async (req, res) => {
    if (!con._connected) {
        throw new ApiError(500, 'Database connection not established');
    } else {
        try {
            const result = await con.query('SELECT id, name, email, role_id, created_at FROM users');
            res.json(result.rows);
        } catch (error) {
            console.error('Error executing query', error);
            throw new ApiError(500, 'Ошибка сервера');
        }
    }
});

app.get('/api/resources', async (req, res) => {
    if (!con._connected) {
        throw new ApiError(500, 'Database connection not established');
    }
    try {
        const result = await con.query('SELECT * FROM resources');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.get('/api/bookings', verifyToken, async (req, res) => {
    if (!con._connected) {
        throw new ApiError(500, 'Database connection not established');
    }
    try {
        const result = await con.query('SELECT * FROM bookings');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.get('/api/roles', async (req, res) => {
    if (!con._connected) {
        throw new ApiError(500, 'Database connection not established');
    }
    try {
        const result = await con.query('SELECT * FROM roles');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.get('/api/payments', verifyToken, async (req, res) => {
    if (!con._connected) {
        throw new ApiError(500, 'Database connection not established');
    }
    try {
        const result = await con.query('SELECT * FROM payments');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.get('/api/logs', verifyToken, async (req, res) => {
    if (!con._connected) {
        throw new ApiError(500, 'Database connection not established');
    }
    try {
        const result = await con.query('SELECT * FROM logs');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.get('/api/users/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildRead(
            'users',
            id
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Пользователь не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
        next(error);
    }
});

app.get('/api/resources/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildRead(
            'resources',
            id
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Ресурс не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
        next(error);
    }
});

app.get('/api/bookings/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildRead(
            'bookings',
            id
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Бронирование не найдено');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.get('/api/roles/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildRead(
            'roles',
            id
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Роль не найдена');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
        next(error);
    }
});

app.get('/api/payments/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildRead(
            'payments',
            id
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Платеж не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
        next(error);
    }
});

app.get('/api/logs/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildRead(
            'logs',
            id
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Лог не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
        next(error);
    }
});

app.patch('/api/users/:id', verifyToken, validateRegister, async (req, res, next) => {
    const { id } = req.params;
    if ( req.user.id === id && req.user.role_id !== 3 && req.body.role_id !== 3) {
        throw new ApiError(403, 'Нельзя изменить собственную роль на неадминистратора');
    }

    try {
        const result = await buildUpdate(
            'users',
            id,
            req.body,
            ['name', 'email', 'password', 'role_id']
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Пользователь не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.patch('/api/resources/:id', verifyToken, validateResource, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildUpdate(
            'resources',
            id,
            req.body,
            ['name', 'description', 'type', 'status', 'price_per_hour']
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Ресурс не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при обновлении ресурса:', error);
        next(error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.patch('/api/bookings/:id', verifyToken, validateBooking, async (req, res, next) => {
    const { id } = req.params;
    try {
        const resourceUpdate = await buildUpdate(
            'resources',
            req.body.resource_id,
            { status: req.body.status },
            ['status']
        );
        if (resourceUpdate.rowCount === 0) {
            throw new ApiError(400, 'Не указаны поля для обновления');
        }

        const result = await buildUpdate(
            'bookings',
            id,
            req.body,
            ['user_id', 'resource_id', 'start_time', 'end_time', 'status']
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Бронирование не найдено');
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.patch('/api/roles/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildUpdate(
            'roles',
            id,
            req.body,
            ['name']
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Роль не найдена');
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.patch('/api/payments/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildUpdate(
            'payments',
            id,
            req.body,
            ['booking_id', 'amount', 'status', 'payment_method', 'created_at']
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Платеж не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.patch('/api/logs/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await buildUpdate(
            'logs',
            id,
            req.body,
            ['user_id', 'resource_id', 'start_time', 'end_time', 'status']
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Лог не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.delete('/api/bookings/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await con.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
        if (user.rowCount === 0 || user.rows[0].role_id !== 3) {
            return res.status(403).json({ error: 'Нет прав для удаления этого бронирования' });
        }

        const booking = await con.query('SELECT resource_id FROM bookings WHERE id = $1', [id]);
        if (booking.rowCount > 0) {
            await con.query(
                'UPDATE resources SET status = $1 WHERE id = $2',
                ['Свободен', booking.rows[0].resource_id]
            );
        }

        const result = await buildDelete(
            'bookings',
            id
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Бронирование не найдено' });
        }
        res.json({ message: 'Бронирование удалено', booking: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при удалении бронирования', error);
        next(new ApiError(500, 'Ошибка сервера'));
    }
});

app.delete('/api/users/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        // Проверяем роль пользователя из req.user
        const user = await con.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
        if (user.rowCount === 0 || user.rows[0].role_id !== 3) {
            return res.status(403).json({ error: 'Нет прав для удаления этого пользователя' });
        }

        const result = await buildDelete(
            'users',
            id
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json({ message: 'Пользователь удалён', user: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при удалении пользователя', error);
        next(new ApiError(500, 'Ошибка сервера'));
    }
});

app.delete('/api/resources/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        // Проверяем роль пользователя из req.user
        const user = await con.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
        if (user.rowCount === 0 || user.rows[0].role_id !== 3) {
            return res.status(403).json({ error: 'Нет прав для удаления этого ресурса' });
        }

        const result = await buildDelete(
            'resources',
            id
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ресурс не найден' });
        }
        res.json({ message: 'Ресурс удалён', resource: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при удалении ресурса', error);
        next(new ApiError(500, 'Ошибка сервера'));
    }
});

app.delete('/api/roles/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        // Проверяем роль пользователя из req.user
        const user = await con.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
        if (user.rowCount === 0 || user.rows[0].role_id !== 3) {
            return res.status(403).json({ error: 'Нет прав для удаления этой роли' });
        }

        const result = await buildDelete(
            'roles',
            id
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Роль не найдена' });
        }
        res.json({ message: 'Роль удалёна', role: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при удалении роли', error);
        next(new ApiError(500, 'Ошибка сервера'));
    }
});

app.use(errorHandler);
module.exports = app;