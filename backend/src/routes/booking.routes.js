const express = require('express');
const router = express.Router();

const con = require('../../../db/db.js');
const verifyToken = require('../../verifyToken.js');
const { verifyRole, roles } = require('../../../middleware/checkRole.js');
const { validateBooking } = require('../../../middleware/validators.js');
const { ApiError } = require('../../../middleware/errorHandler.js');
const { buildRead, buildUpdate, buildDelete } = require('../../apiConstructor.js');

// server.js
// POST /api/bookings
router.post('/', verifyToken, validateBooking, async (req, res) => {
  const userId = req.user.id;
  const { resource_id, start_time, end_time, status } = req.body;

  try {
    const conflict = await con.query(
      `SELECT id FROM bookings
             WHERE resource_id = $1
               AND status != 'cancelled'
               AND $2 < end_time
               AND $3 > start_time
             LIMIT 1`,
      [resource_id, start_time, end_time]
    );

    if (conflict.rowCount > 0) {
      return res.status(409).json({ error: 'Ресурс уже забронирован на это время' });
    }

    const result = await con.query(
      `INSERT INTO bookings (user_id, resource_id, start_time, end_time, status, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING *`,
      [userId, resource_id, start_time, end_time, status]
    );

    res.status(201).json(result.rows[0]);
  } catch {
    throw new ApiError(500, 'Ошибка сервера');
  }
});

// api.js
// GET /api/bookings
router.get('/', verifyToken, async (req, res) => {
  if (!con._connected) {
    throw new ApiError(500, 'Database connection not established');
  }
  try {
    if (req.user.role_id !== roles.ADMIN && req.user.role_id !== roles.MANAGER) {
      const result = await con.query('SELECT * FROM bookings WHERE user_id = $1', [req.user.id]);
      return res.json(result.rows);
    }

    const result = await con.query('SELECT * FROM bookings');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    throw new ApiError(500, 'Ошибка сервера');
  }
});

// GET /api/bookings/:id
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await buildRead('bookings', id);

    if (result.rowCount === 0) {
      throw new ApiError(404, 'Бронирование не найдено');
    }

    if (
      req.user.role_id !== roles.ADMIN &&
      req.user.role_id !== roles.MANAGER &&
      result.rows[0].user_id !== req.user.id
    ) {
      throw new ApiError(403, 'Доступ запрещен');
    }

    res.json(result.rows[0]);
  } catch {
    throw new ApiError(500, 'Ошибка сервера');
  }
});

// PATCH /api/bookings/:id
router.patch('/:id', verifyToken, validateBooking, async (req, res) => {
  const { id } = req.params;
  const { resource_id, start_time, end_time } = req.body;

  try {
    if (req.user.role_id !== roles.ADMIN && req.user.role_id !== roles.MANAGER) {
      const booking = await con.query('SELECT user_id FROM bookings WHERE id = $1', [id]);
      if (booking.rowCount === 0) {
        throw new ApiError(404, 'Бронирование не найдено');
      }
      if (booking.rows[0].user_id !== req.user.id) {
        throw new ApiError(403, 'Доступ запрещен');
      }
    }

    const conflict = await con.query(
      `SELECT id FROM bookings
             WHERE resource_id = $1
                AND status != 'cancelled'
                AND $2 < end_time
                AND $3 > start_time
                AND id != $4
             LIMIT 1`,
      [resource_id, start_time, end_time, id]
    );

    if (conflict.rowCount > 0) {
      return res.status(409).json({ error: 'Ресурс уже забронирован на это время' });
    }

    const resourceUpdate = await buildUpdate('resources', req.body.resource_id, {
      status: req.body.status,
    });
    if (resourceUpdate.rowCount === 0) {
      throw new ApiError(400, 'Не указаны поля для обновления');
    }

    const result = await buildUpdate('bookings', id, req.body);
    if (result.rowCount === 0) {
      throw new ApiError(404, 'Бронирование не найдено');
    }
    res.json(result.rows[0]);
  } catch {
    throw new ApiError(500, 'Ошибка сервера');
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', verifyToken, verifyRole(roles.ADMIN), async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await con.query('SELECT resource_id FROM bookings WHERE id = $1', [id]);
    if (booking.rowCount > 0) {
      await con.query('UPDATE resources SET status = $1 WHERE id = $2', [
        'Свободен',
        booking.rows[0].resource_id,
      ]);
    }

    const result = await buildDelete('bookings', id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    res.json({ message: 'Бронирование удалено', booking: result.rows[0] });
  } catch (error) {
    console.error('Ошибка при удалении бронирования', error);
    throw new ApiError(500, 'Ошибка сервера');
  }
});

module.exports = router;
