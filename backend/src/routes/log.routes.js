const express = require('express');
const router = express.Router();

const con = require('../../../db/db.js');
const verifyToken = require('../../verifyToken.js');
const { ApiError } = require('../../../middleware/errorHandler.js');
const { buildRead, buildUpdate, buildDelete } = require('../../apiConstructor.js');

// api.js
// GET /api/logs
router.get('/', verifyToken, async (req, res) => {
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

// GET /api/logs/:id
router.get('/:id', verifyToken, async (req, res, next) => {
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

// PATCH /api/logs/:id
router.patch('/:id', verifyToken, async (req, res, next) => {
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

// DELETE /api/logs/:id
router.delete('/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        // Проверяем роль пользователя из req.user
        const user = await con.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
        if (user.rowCount === 0 || user.rows[0].role_id !== 3) {
            return res.status(403).json({ error: 'Нет прав для удаления этого лога' });
        }

        const result = await buildDelete(
            'logs',
            id
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Лог не найден' });
        }
        res.json({ message: 'Лог удалён', log: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при удалении лога', error);
        next(new ApiError(500, 'Ошибка сервера'));
    }
});

module.exports = router;