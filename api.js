const express = require('express');
const app = express();
app.use(express.json());
const con = require('./db_local/db.js');

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

app.get('/api/bookings', async (req, res) => {
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

app.get('/api/payments', async (req, res) => {
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

app.get('/api/logs', async (req, res) => {
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