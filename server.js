const express = require('express');
const con = require('./db/db.js');
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
    console.log('|_______________________|_________________________________________________|');
    console.log('|Стартовая страница:    |http://localhost:3000/index                      |');
    console.log('|-----------------------|-------------------------------------------------|');
    console.log('|Главная страница:      |http://localhost:3000/Buking/home/index.html     |');
    console.log('|-----------------------|-------------------------------------------------|');
    console.log('|sign_in:               |http://localhost:3000/Buking/sign_in/index.html  |');
    console.log('|-----------------------|-------------------------------------------------|');
    console.log('|Админ понель:          |http://localhost:3000/admin/admin.html           | ');
    console.log('|_______________________|_________________________________________________|');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

app.post('/api/users', validateRegister, async (req, res, next) => {
    const { name, email, password, role_id } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Заполните все поля' });
    }
    try {
        const check = await con.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (check.rowCount > 0) {
            return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
        }

        const hashed = await hashPassword(password);

        const result = await con.query(
            'INSERT INTO users (name, email, password_hash, role_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, role_id',
            [name, email, hashed, role_id || 1]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении пользователя', error);
        next(new ApiError(500, 'Ошибка сервера'));
    }
});

app.post('/api/resources', verifyToken, validateResource, async (req, res, next) => {
    const { name, type, description, price_per_hour, status } = req.body;
    if (!name || !type || !description || !price_per_hour || !status) {
        return res.status(400).json({ error: 'Заполните все поля' });
    }
    try {
        const result = await con.query(
            'INSERT INTO resources (name, type, description, price_per_hour, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, type, description, price_per_hour, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении ресурса', error);
        next(new ApiError(500, 'Ошибка сервера'));
    }
});

app.post('/api/bookings', verifyToken, validateBooking, async (req, res, next) => {
    const { user_id, resource_id, start_time, end_time, status } = req.body;
    if (!user_id || !resource_id || !start_time || !end_time || !status) {
        return res.status(400).json({ error: 'Заполните все поля' });
    }
    try {
        const result = await con.query(
            'INSERT INTO bookings (user_id, resource_id, start_time, end_time, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [user_id, resource_id, start_time, end_time, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении бронирования', error);
        next(new ApiError(500, 'Ошибка сервера'));
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
            return res.status(404).json({ error: 'Ресурс не найден' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при обновлении ресурса', error);
        next(new ApiError(500, 'Ошибка сервера'));
    }
});


app.use(errorHandler);