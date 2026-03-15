const express = require('express');
const con = require('../../db/db.js');
const app = require('./api.js');
const { hashPassword } = require('../hashing.js');
const verifyToken = require('../verifyToken.js');
const { validateRegister, validateResource, validateBooking } = require('../../middleware/validators.js');
const { errorHandler, ApiError } = require('../../middleware/errorHandler.js');

app.get('/', (req, res) => {
    res.send('Привет, Express!');
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
    console.log('|_______________________|_________________________________________________|');
    console.log('|Стартовая страница:    |http://localhost:3000/index                      |');
    console.log('|-----------------------|-------------------------------------------------|');
    console.log('|Главная страница:      |http://localhost:3000/Buking/home/index.html     |');
    console.log('|-----------------------|-------------------------------------------------|');
    console.log('|sign_in:               |http://localhost:3000/Buking/sign_in/index.html  |');
    console.log('|-----------------------|-------------------------------------------------|');
    console.log('|Админ понель:          |http://localhost:3000/admin/admin.html           | ');
    console.log('|_______________________|_________________________________________________|');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));
app.use(errorHandler);