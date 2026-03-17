const express = require('express');
const router = express.Router();

const con = require('../../../db/db.js');
const jwt = require('jsonwebtoken');
const { comparePassword } = require('../../hashing.js');
const { ApiError } = require('../../../middleware/errorHandler.js');

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, 'Заполните все поля');
    }
    try {
        const result = await con.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) {
            throw new ApiError(401, 'Неверный email или пароль');
        }
        const user = result.rows[0];

        const ok = await comparePassword(password, user.password_hash);
        if (!ok) {
            throw new ApiError(401, 'Неверный email или пароль');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id },
            process.env.JWT_SECRET || '789456123',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role_id: user.role_id } });
    } catch (error) {
        console.error('Ошибка при входе пользователя', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Ошибка сервера');
    }
});

module.exports = router;