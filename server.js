const express = require('express');
const app = express();
app.use(express.json());
const con = require('./db_local/db.js');

app.get('/', (req, res) => {
    res.send('Привет, Express!');
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

app.get('/api/users', async (req, res) => {
    if (!con._connected) {
        return res.status(500).json({ error: 'Database connection not established' });
    } else {
        try {
            const result = await con.query('SELECT * FROM users');
            res.json(result.rows);
        } catch (error) {
            console.error('Error executing query', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.post('/api/users', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Заполните все поля' });
    }
    try {
        // Проверка на уникальность email
        const check = await con.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (check.rowCount > 0) {
            return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
        }
        // Вставка пользователя
        const result = await con.query(
            'INSERT INTO users (name, email, password_hash, role_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [name, email, password, 3]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении пользователя', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});