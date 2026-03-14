# Bukings - Инструкции для AI Coding Agents

## 🏗️ Архитектура проекта

Это **система бронирования ресурсов** с Express.js backend и Vanilla JS frontend.

### Основные компоненты
- **server.js** - entry point, объединяет api.js и статику
- **api.js** - REST API с JWT auth, экспортирует Express app
- **db_local/** - PostgreSQL подключение и миграции
- **backend/** - утилиты (hashing, JWT verify, api_constructor)
- **public/** - статичный frontend (Vanilla JS, без фреймворков)

### Модель данных
```
users → bookings ← resources
  ↓        ↓
roles   payments
  ↓
logs
```
См. [DOC/ERD_DIAGRAM.md](../DOC/ERD_DIAGRAM.md) для полной схемы связей.

## 🚀 Workflow разработки

### Запуск проекта
```bash
npm run dev        # nodemon main.js (в разработке)
npm run server     # node server.js (продакшн)
npm run migrate    # применить миграции БД
```

### Подключение к БД
Используй переменные окружения (см. [ENV_SETUP.md](../ENV_SETUP.md)):
```bash
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=12345678
DB_NAME=db_bronare
JWT_SECRET=789456123  # дефолт, переопредели в .env
```

Файл [db_local/db.js](../db/db.js) автоматом подключается при импорте.

### Миграции
Запускай `npm run migrate` для создания таблиц. Файл [db_local/migrate.js](../db/migrate.js) содержит все CREATE TABLE с IF NOT EXISTS.

## 🔑 Паттерны аутентификации

### JWT токены
- **Секрет по умолчанию**: `789456123` (переопредели через `JWT_SECRET`)
- **Срок жизни**: 24 часа
- **Формат заголовка**: `Authorization: Bearer <token>`

### Backend middleware
```javascript
const verifyToken = require('./backend/Verify_Token.js');
app.get('/api/protected', verifyToken, handler); // req.user доступен
```

### Frontend модуль
Используй глобальный объект `auth` из [public/js/auth.js](../public/js/auth.js):
```javascript
// Проверка авторизации
auth.requireAuth(); // редирект если нет токена
auth.requireRole(3); // проверка роли (3 = admin)

// Запросы с токеном
const res = await auth.authFetch('/api/bookings', { method: 'POST', ... });
```

### Роли пользователей
- **1** - обычный пользователь
- **3** - администратор (доступ к [public/admin/admin.html](../public/admin/admin.html))

## 📝 CRUD паттерны

### Стандартный подход в api.js
```javascript
// GET /api/resources - список
// POST /api/resources - создание (с verifyToken если нужно)
// DELETE /api/resources/:id - удаление
```

### Универсальные CRUD-хелперы
Файл [backend/api_constructor.js](../backend/api_constructor.js) содержит:
```javascript
buildRead(table, id)           // SELECT * FROM table WHERE id = $1
buildUpdate(table, id, data, allowed) // UPDATE с белым списком полей
buildDelete(table, id)         // DELETE FROM table WHERE id = $1
```

**Пример использования**:
```javascript
const { buildUpdate } = require('./backend/api_constructor.js');
app.put('/api/users/:id', async (req, res) => {
    const result = await buildUpdate('users', req.params.id, req.body, ['name', 'email']);
    res.json(result.rows[0]);
});
```

## 🛡️ Обработка ошибок

### ApiError класс
```javascript
const { ApiError } = require('./middleware/errorHandler.js');
throw new ApiError(404, 'Пользователь не найден');
```

### Централизованный handler
Подключай в конце app:
```javascript
app.use(errorHandler); // из middleware/errorHandler.js
```

### Валидация
Middleware в [middleware/validators.js](../middleware/validators.js):
- `validateRegister` - проверка name/email/password
- `validateResource` - проверка полей ресурса
- `validateBooking` - проверка бронирования

## 🎨 Frontend структура

### Vanilla JS без сборщика
- Нет Webpack/Vite - прямые `<script>` теги
- Модули через глобальные переменные (`auth`, `nav`)
- Fetch API для всех запросов

### Навигация
Файл [public/js/nav.js](../public/js/nav.js) управляет навигацией:
```javascript
// В HTML: <div id="navbar"></div>
// nav.js автоматом вставляет меню и обновляет активный элемент
```

### Админка
[public/admin/admin.js](../public/admin/admin.js) использует универсальную функцию `setupSection(sectionId, apiUrl, columns)` для генерации CRUD-интерфейса к каждой таблице.

## 📚 Документация

### Ключевые файлы в DOC/
- [PROJECT_STRUCTURE.md](../DOC/PROJECT_STRUCTURE.md) - структура и задачи
- [JWT_AUTH_README.md](../DOC/JWT_AUTH_README.md) - подробно о JWT
- [CODE_TEMPLATES.md](../DOC/CODE_TEMPLATES.md) - шаблоны кода
- [CRITICAL_TASKS.md](../DOC/CRITICAL_TASKS.md) - незавершённые задачи

### Незавершённые фичи (см. DOC/PROJECT_STRUCTURE.md)
- PUT endpoints для редактирования (частично есть через api_constructor)
- Пагинация в админке
- Stripe интеграция для платежей
- Unit/integration тесты

## 💡 Советы

- **Не используй ORM** - прямые SQL запросы через `con.query()`
- **Хеширование**: всегда через [backend/hashing.js](../backend/hashing.js), никогда plaintext
- **Новые endpoints**: добавляй в [api.js](../api.js), импортируй в [server.js](../server.js)
- **Дубликаты в bookings**: файл [db_local/db.js](../db/db.js) при старте удаляет дубли по (user_id, resource_id)
- **Триггеры БД**: см. [db_local/trigger.js](../db/trigger.js) (закомментированы в миграции)

## 🐛 Отладка

### Проверка подключения к БД
```javascript
if (!con._connected) {
    throw new ApiError(500, 'Database connection not established');
}
```

### Логирование
Используй `console.error()` в catch-блоках. Централизованный логгер отсутствует.

### Проверка токена
В браузере: `localStorage.getItem('token')` должен содержать JWT.
