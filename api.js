const express = require('express');
const app = express();
app.use(express.json());
const con = require('./db_local/db.js');
const jwt = require('jsonwebtoken');
const verifyToken = require('./backend/Verify_Token.js');
const { comparePassword } = require('./backend/hashing.js');

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Заполните все поля' });
    }
    try {
        const result = await con.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        const user = result.rows[0];

        const ok = await comparePassword(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id },
            process.env.JWT_SECRET || '789456123',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role_id: user.role_id } });
    } catch (error) {
        console.error('Ошибка при входе пользователя', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/users', async (req, res) => {
    if (!con._connected) {
        return res.status(500).json({ error: 'Database connection not established' });
    } else {
        try {
            const result = await con.query('SELECT id, name, email, role_id, created_at FROM users');
            res.json(result.rows);
        } catch (error) {
            console.error('Error executing query', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.get('/api/resources', async (req, res) => {
    if (!con._connected) {
        return res.status(500).json({ error: 'Database connection not established' });
    }
    try {
        const result = await con.query('SELECT * FROM resources');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/bookings', verifyToken, async (req, res) => {
    if (!con._connected) {
        return res.status(500).json({ error: 'Database connection not established' });
    }
    try {
        const result = await con.query('SELECT * FROM bookings');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/roles', async (req, res) => {
    if (!con._connected) {
        return res.status(500).json({ error: 'Database connection not established' });
    }
    try {
        const result = await con.query('SELECT * FROM roles');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/payments', verifyToken, async (req, res) => {
    if (!con._connected) {
        return res.status(500).json({ error: 'Database connection not established' });
    }
    try {
        const result = await con.query('SELECT * FROM payments');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/logs', verifyToken, async (req, res) => {
    if (!con._connected) {
        return res.status(500).json({ error: 'Database connection not established' });
    }
    try {
        const result = await con.query('SELECT * FROM logs');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = app;