const express = require('express');
const router = express.Router();

const con = require('../../../db/db.js');
const verifyToken = require('../../verifyToken.js');
const { verifyRole, roles } = require('../../../middleware/checkRole.js');
const { ApiError } = require('../../../middleware/errorHandler.js');
const { buildRead, buildUpdate, buildDelete } = require('../../apiConstructor.js');

// api.js
// GET /api/roles
router.get('/', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
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

// GET /api/roles/:id
router.get('/:id', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
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
    }
});

// PATCH /api/roles/:id
router.patch('/:id', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await buildUpdate(
            'roles',
            id,
            req.body
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Роль не найдена');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
    }
});

// DELETE /api/roles/:id
router.delete('/:id', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
    const { id } = req.params;
    try {
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
        throw new ApiError(500, 'Ошибка сервера');
    }
});

module.exports = router;