const express = require('express');
const path = require('path');
const app = require('./api.js');

const publicDir = path.resolve(__dirname, '../../public');

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log('|_______________________|_________________________________________________|');
    console.log(`|Стартовая страница:    |http://localhost:${PORT}/index                      |`);
    console.log('|-----------------------|-------------------------------------------------|');
    console.log(`|Главная страница:      |http://localhost:${PORT}/Buking/home/index.html     |`);
    console.log('|-----------------------|-------------------------------------------------|');
    console.log(`|sign_in:               |http://localhost:${PORT}/Buking/sign_in/index.html  |`);
    console.log('|-----------------------|-------------------------------------------------|');
    console.log(`|Админ понель:          |http://localhost:${PORT}/admin/admin.html           |`);
    console.log('|_______________________|_________________________________________________|');
});

app.use(express.static(publicDir));