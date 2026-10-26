const express = require('express');
const path = require('path');
const app = require('./api.js');
const { migrate } = require('../../db/migrate.js');

const publicDir = path.resolve(__dirname, '../../public');

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Инициализация БД при старте сервера
async function initializeDatabase() {
  try {
    await migrate();
    console.log('✓ Инициализация БД успешна!');
  } catch (error) {
    console.error('⚠️ Ошибка инициализации БД:', error.message);
    // Не прерываем запуск сервера — может быть просто БД недоступна
  }
}

const PORT = process.env.PORT || 3000;

// Инициализируем БД, затем запускаем сервер
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log('|_______________________|_________________________________________________|');
      console.log(`|Стартовая страница:    |http://localhost:${PORT}/                           |`);
      console.log('|-----------------------|-------------------------------------------------|');
      console.log(`|Главная страница:      |http://localhost:${PORT}/Buking/home/index.html     |`);
      console.log('|-----------------------|-------------------------------------------------|');
      console.log(`|sign_in:               |http://localhost:${PORT}/Buking/sign_in/index.html  |`);
      console.log('|-----------------------|-------------------------------------------------|');
      console.log(`|Админ панель:          |http://localhost:${PORT}/admin/admin.html           |`);
      console.log('|_______________________|_________________________________________________|');
    });
  })
  .catch((error) => {
    console.error('Критическая ошибка при запуске:', error);
    process.exit(1);
  });

app.use(express.static(publicDir));
