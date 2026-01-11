const express = require('express');
const app = express();
app.use(express.json());
const con = require('./db_local/db.js');
const jwt = require('jsonwebtoken');
const verifyToken = require('./backend/Verify_Token.js');
const { comparePassword } = require('./backend/hashing.js');
const { validateRegister, validateResource, validateBooking } = require('./middleware/validators');
const { errorHandler, ApiError } = require('./middleware/errorHandler.js');


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
        const result = await con.query(
            'SELECT id, name, email, role_id, created_at FROM users WHERE id = $1',
            [id]
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
        const result = await con.query(
            'SELECT * FROM resources WHERE id = $1',
            [id]
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
        const result = await con.query(
            'SELECT * FROM bookings WHERE id = $1',
            [id]
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
        const result = await con.query(
            'SELECT * FROM roles WHERE id = $1',
            [id]
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
        const result = await con.query(
            'SELECT * FROM payments WHERE id = $1',
            [id]
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
        const result = await con.query(
            'SELECT * FROM logs WHERE id = $1',
            [id]
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
        const result = await con.query(
            'UPDATE users SET name = $1, email = $2, role_id = $3 WHERE id = $4 RETURNING id, name, email, role_id, created_at',
            [req.body.name, req.body.email, req.body.role_id, id]
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
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (req.body.name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(req.body.name);
        }
        if (req.body.description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(req.body.description);
        }
        if (req.body.type !== undefined) {
            updates.push(`type = $${paramCount++}`);
            values.push(req.body.type);
        }
        if (req.body.status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(req.body.status);
        }
        if (req.body.price_per_hour !== undefined) {
            updates.push(`price_per_hour = $${paramCount++}`);
            values.push(req.body.price_per_hour);
        }
        
        if (updates.length === 0) {
            throw new ApiError(400, 'Не указаны поля для обновления');
        }
        
        values.push(id);
        const query = `UPDATE resources SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await con.query(query, values);
        
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
        con.query(
            'UPDATE resources SET status = $1 WHERE id = $2 RETURNING *', [req.body.status, req.body.resource_id])
            .then(() => {
                console.log('Ресурс успешно обновлен внутри бронирования');
            })
            .catch(error => {
                console.error('Ошибка при обновлении ресурса внутри бронирования:', error);
            });

        const result = await con.query(
            'UPDATE bookings SET user_id = $1, resource_id = $2, start_time = $3, end_time = $4, status = $5 WHERE id = $6 RETURNING *',
            [req.body.user_id, req.body.resource_id, req.body.start_time, req.body.end_time, req.body.status, id]
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
        const result = await con.query(
            'UPDATE roles SET name = $1 WHERE id = $2 RETURNING *',
            [req.body.name, id]
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
        const result = await con.query(
            'UPDATE payments SET booking_id = $1, amount = $2, status = $3, payment_method = $4 WHERE id = $5 RETURNING *',
            [req.body.booking_id, req.body.amount, req.body.status, req.body.payment_method, id]
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
        const result = await con.query(
            'UPDATE logs SET user_id = $1, resource_id = $2, start_time = $3, end_time = $4, status = $5 WHERE id = $6 RETURNING *',
            [req.body.user_id, req.body.resource_id, req.body.start_time, req.body.end_time, req.body.status, id]
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

// Глобальный обработчик ошибок
app.use(errorHandler);
module.exports = app;