const express = require('express');
const router = express.Router();

const con = require('../../../db/db.js');
const verifyToken = require('../../verifyToken.js');
const { verifyRole, roles } = require('../../../middleware/checkRole.js');
const { validateResource } = require('../../../middleware/validators.js');
const { ApiError } = require('../../../middleware/errorHandler.js');
const { buildRead, buildUpdate, buildDelete } = require('../../apiConstructor.js');

// server.js
// POST /api/resources
router.post('/', verifyToken, validateResource, verifyRole(roles.ADMIN), async (req, res) => {
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
        throw new ApiError(500, 'Ошибка сервера');
    }
});

// api.js
// GET /api/resources
router.get('/', async (req, res) => {
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

// GET /api/resources/:id
router.get('/:id', async (req, res) => {
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
    }
});

// PATCH /api/resources/:id
router.patch('/:id', verifyToken, validateResource, verifyRole(roles.ADMIN), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await buildUpdate(
            'resources',
            id,
            req.body
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Ресурс не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при обновлении ресурса:', error);
        throw new ApiError(500, 'Ошибка сервера');
    }
});


// DELETE /api/resources/:id
router.delete('/:id', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
    const { id } = req.params;
    try {
        // Проверяем роль пользователя из req.user
        const user = await con.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
        if (user.rowCount === 0 || user.rows[0].role_id !== roles.ADMIN) {
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

module.exports = router;