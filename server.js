const express = require('express');
/*const app = express();
app.use(express.json());*/
const con = require('./db_local/db.js');
const app = require('./api.js');
const { hashPassword } = require('./backend/hashing.js');
const verifyToken = require('./backend/Verify_Token.js');
const { validateRegister, validateResource, validateBooking } = require('./middleware/validators');
const { errorHandler, ApiError } = require('./middleware/errorHandler.js');

app.get('/', (req, res) => {
    res.send('Привет, Express!');
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
    console.log('Для начала тестирования: http://localhost:3000/index');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

app.post('/api/users', validateRegister, async (req, res, next) => {
    const { name, email, password, role_id } = req.body;
    if (!name || !email || !password) {
        throw new ApiError(400, 'Заполните все поля');
    }
    try {
        const check = await con.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (check.rowCount > 0) {
            throw new ApiError(409, 'Пользователь с таким email уже существует');
        }

        const hashed = await hashPassword(password);

        const result = await con.query(
            'INSERT INTO users (name, email, password_hash, role_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, role_id',
            [name, email, hashed, role_id || 1]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении пользователя', error);
        throw new ApiError(500, 'Ошибка сервера');
        next(error);
    }
});

app.post('/api/resources', verifyToken, validateResource, async (req, res, next) => {
    const { name, type, description, price_per_hour, status } = req.body;
    if (!name || !type || !description || !price_per_hour || !status) {
        throw new ApiError(400, 'Заполните все поля');
    }
    try {
        const result = await con.query(
            'INSERT INTO resources (name, type, description, price_per_hour, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, type, description, price_per_hour, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении ресурса', error);
        throw new ApiError(500, 'Ошибка сервера');
        next(error);
    }
});

app.post('/api/bookings', verifyToken, validateBooking, async (req, res, next) => {
    const { user_id, resource_id, start_time, end_time, status } = req.body;
    if (!user_id || !resource_id || !start_time || !end_time || !status) {
        throw new ApiError(400, 'Заполните все поля');
    }
    try {
        const result = await con.query(
            'INSERT INTO bookings (user_id, resource_id, start_time, end_time, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [user_id, resource_id, start_time, end_time, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении бронирования', error);
        throw new ApiError(500, 'Ошибка сервера');
        next(error);
    }
});

app.patch('/api/resources/:id', verifyToken, validateResource, async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await con.query(
            'UPDATE resources SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
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

app.delete('/api/bookings/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        con.query('UPDATE resources SET status = $1 WHERE id = (SELECT resource_id FROM bookings WHERE id = $2) RETURNING *', ['Свободен', id])
            .then(result => {
                console.log('Обновленный ресурс:', result.rows[0]);
            })
            .catch(err => {
                console.error('Ошибка при обновлении ресурса', err);
            });
        const result = await con.query(
            'DELETE FROM bookings WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Бронирование не найдено');
        }
        res.json({ message: 'Бронирование удалено', booking: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при удалении бронирования', error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.delete('/api/users/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await con.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Пользователь не найден');
        }
        res.json({ message: 'Пользователь удалён', user: result.rows[0] });
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.delete('/api/resources/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await con.query(
            'DELETE FROM resources WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Ресурс не найден');
        }
        res.json({ message: 'Ресурс удалён', resource: result.rows[0] });
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
    }
});

app.use(errorHandler);