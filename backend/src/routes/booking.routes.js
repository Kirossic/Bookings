const express = require('express');
const router = express.Router();

const con = require('../../../db/db.js');
const verifyToken = require('../../verifyToken.js');
const { validateBooking } = require('../../../middleware/validators.js');
const { ApiError } = require('../../../middleware/errorHandler.js');
const { buildRead, buildUpdate, buildDelete } = require('../../apiConstructor.js');

// server.js
// POST /api/bookings
router.post('/', verifyToken, validateBooking, async (req, res, next) => {
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

// api.js
// GET /api/bookings
router.get('/', verifyToken, async (req, res) => {
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

// GET /api/bookings/:id
router.get('/:id', verifyToken, async (req, res, next) => {
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

// PATCH /api/bookings/:id
router.patch('/:id', verifyToken, validateBooking, async (req, res, next) => {
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

// DELETE /api/bookings/:id
router.delete('/:id', verifyToken, async (req, res, next) => {
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

module.exports = router;