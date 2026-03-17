const express = require('express');
const router = express.Router();

const con = require('../../../db/db.js');
const verifyToken = require('../../verifyToken.js');
const { verifyRole, roles } = require('../../../middleware/checkRole.js');
const { ApiError } = require('../../../middleware/errorHandler.js');
const { buildRead, buildUpdate, buildDelete } = require('../../apiConstructor.js');

// api.js
// GET /api/payments
router.get('/', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
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

// GET /api/payments/:id
router.get('/:id', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await buildRead(
            'payments',
            id
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Платеж не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
    }
});

// PATCH /api/payments/:id
router.patch('/:id', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await buildUpdate(
            'payments',
            id,
            req.body,
            ['booking_id', 'amount', 'status', 'payment_method', 'created_at']
        );
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Платеж не найден');
        }
        res.json(result.rows[0]);
    } catch (error) {
        throw new ApiError(500, 'Ошибка сервера');
    }
});

module.exports = router;