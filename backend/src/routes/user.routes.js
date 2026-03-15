const express = require('express');
const router = express.Router();

const con = require('../../../db/db.js');
const verifyToken = require('../../verifyToken.js');
const { hashPassword } = require('../../hashing.js');
const { validateRegister } = require('../../../middleware/validators.js');
const { ApiError } = require('../../../middleware/errorHandler.js');
const { buildRead, buildUpdate, buildDelete } = require('../../apiConstructor.js');

// server.js
router.post('/', validateRegister, async (req, res, next) => {
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

// api.js
// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    if (!con._connected) throw new ApiError(500, 'Database connection not established');
    const result = await con.query('SELECT id, name, email, role_id, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const result = await buildRead('users', req.params.id);
    if (result.rowCount === 0) throw new ApiError(404, 'Пользователь не найден');
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/:id
router.patch('/:id', verifyToken, validateRegister, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (Number(req.user.id) === Number(id) && req.user.role_id !== 3 && req.body.role_id !== 3) {
      throw new ApiError(403, 'Нельзя изменить собственную роль на неадминистратора');
    }

    const result = await buildUpdate('users', id, req.body, ['name', 'email', 'password', 'role_id']);
    if (!result || result.rowCount === 0) throw new ApiError(404, 'Пользователь не найден');

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await con.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
    if (user.rowCount === 0 || user.rows[0].role_id !== 3) {
      return res.status(403).json({ error: 'Нет прав для удаления этого пользователя' });
    }

    const result = await buildDelete('users', req.params.id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ message: 'Пользователь удалён', user: result.rows[0] });
  } catch (error) {
    console.error('Ошибка при удалении пользователя', error);
    next(new ApiError(500, 'Ошибка сервера'));
  }
});

module.exports = router;