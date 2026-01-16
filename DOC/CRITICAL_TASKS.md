# 🔴 КРИТИЧЕСКИЕ ЗАДАЧИ - БЫСТРЫЙ СТАРТ

**Прогресс проекта:** 47% завершено  
**Блокирующие задачи:** 4 критические работы  
**Примерное время:** 6-10 часов  
**Статус:** 🟡 В процессе

---

## 📋 TASK 3: ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ (2-3 часа)

**Статус:** 🟡 Частично выполнено

**Что осталось:**
- Применить валидаторы к POST эндпоинтам в `server.js`:
  - POST `/api/users` → `validateRegister`
  - POST `/api/resources` → `validateResource`
  - POST `/api/bookings` → `validateBooking`
- Протестировать невалидные данные и ошибки 400

**Код (пример):**
```javascript
// server.js
const { validateRegister, validateResource, validateBooking } = require('./middleware/validators');

// Регистрация пользователя с валидацией
app.post('/api/users', validateRegister, async (req, res, next) => {
  try {
    const { name, email, password, role_id } = req.body;
    // ... существующая логика INSERT
  } catch (err) { next(err); }
});

// Создание ресурса с валидацией
app.post('/api/resources', verifyToken, validateResource, async (req, res, next) => {
  try {
    const { name, type, description, price_per_hour, status } = req.body;
    // ... существующая логика INSERT
  } catch (err) { next(err); }
});

// Создание бронирования с валидацией
app.post('/api/bookings', verifyToken, validateBooking, async (req, res, next) => {
  try {
    const { user_id, resource_id, start_time, end_time, status } = req.body;
    // ... существующая логика INSERT
  } catch (err) { next(err); }
});
```

**Тесты (негативные примеры):**
```bash
# Пользователь: короткое имя
curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"bad@example.com","password":"12345678"}' | jq

# Ресурс: цена <= 0
curl -s -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Room","type":"room","description":"...","price_per_hour":0,"status":"available"}' | jq

# Бронирование: end_time < start_time
curl -s -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"user_id":1,"resource_id":1,"start_time":"2026-01-10T10:00:00Z","end_time":"2026-01-10T09:00:00Z","status":"pending"}' | jq
```

**Чек-лист:**
- [✅] Применить к POST /api/users (server.js)
- [✅] Применить к POST /api/resources (server.js)
- [✅] Применить к POST /api/bookings (server.js)
- [✅] Протестировать негативные сценарии

---

## 📋 TASK 4: ОБРАБОТКА ОШИБОК (2-3 часа)

**Статус:** 🟡 Частично выполнено

**Что осталось:**
- Рефакторнуть эндпоинты в `api.js` и `server.js` на использование `ApiError`
- Унифицировать 400/401/403/404/500 ответы через централизованный `errorHandler`
- Проверить, что `app.use(errorHandler)` подключён единожды

**Код (пример):**
```javascript
// api.js
const { ApiError, errorHandler } = require('./middleware/errorHandler.js');

// Пример: login с ApiError
app.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Заполните все поля');
    const result = await con.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) throw new ApiError(401, 'Неверный email или пароль');
    const user = result.rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) throw new ApiError(401, 'Неверный email или пароль');
    // ... генерация токена
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role_id: user.role_id } });
  } catch (err) { next(err); }
});

// Пример: единообразная обработка
app.get('/api/users', async (req, res, next) => {
  try {
    if (!con._connected) throw new ApiError(500, 'Database connection not established');
    const r = await con.query('SELECT id, name, email, role_id, created_at FROM users');
    res.json(r.rows);
  } catch (err) { next(err); }
});

// Подключать единожды в конце файла api.js
app.use(errorHandler);
```

**Тесты (примеры):**
```bash
# 400: пустые поля логина
curl -s -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{}' | jq

# 401: неверный пароль
curl -s -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email":"jwttest@test.com","password":"wrong"}' | jq

# 500: отключить БД и проверить ответ
curl -s http://localhost:3000/api/users | jq
```

**Чек-лист:**
- [✅] Заменить `res.status().json({ error })` на `throw new ApiError(...)`
- [✅] Пройтись по основным маршрутам (`login`, `users`, `resources`, `bookings`)
- [✅] Добавить тесты для 400/401/403/404/500

---

## 📋 TASK 5: РОЛЕВАЯ АВТОРИЗАЦИЯ И БЕЗОПАСНОСТЬ (новое, 1-2 часа)

**Цель:** ограничить доступ к критическим операциям

**Что сделать:**
- Добавить middleware `requireRole([roles])`
- Ограничить удаление пользователей/ресурсов только ролью `admin` (`role_id = 3`)
- Добавить простой rate limiting для `/api/login`

**Код (пример):**
```javascript
// middleware/requireRole.js (пример реализации)
const { ApiError } = require('./errorHandler');
const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Unauthorized'));
  if (!roles.includes(req.user.role_id)) return next(new ApiError(403, 'Forbidden'));
  next();
};
module.exports = { requireRole };

// server.js — защитить удаление
const { requireRole } = require('./middleware/requireRole');
app.delete('/api/users/:id', verifyToken, requireRole([3]), async (req, res, next) => { /* ... */ });
app.delete('/api/resources/:id', verifyToken, requireRole([3]), async (req, res, next) => { /* ... */ });

// Простой rate limit для /api/login (в памяти)
const attempts = new Map();
const rateLimitLogin = (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = 5;
  const data = attempts.get(key) || { count: 0, start: now };
  if (now - data.start > windowMs) { data.count = 0; data.start = now; }
  data.count += 1;
  attempts.set(key, data);
  if (data.count > limit) return next(new ApiError(429, 'Too Many Requests'));
  next();
};

// api.js
app.post('/api/login', rateLimitLogin, async (req, res, next) => { /* ... */ });
```

**Чек-лист:**
- [ ] Реализовать `requireRole()` и применить к DELETE маршрутам
- [ ] Ограничить `/api/login` (rate limit, например 5 попыток/минуту)
- [ ] Протестировать 403 и превышение лимита

---

## 📋 TASK 6: ПАГИНАЦИЯ И ФИЛЬТРЫ ДЛЯ GET (новое, 1-2 часа)

**Цель:** улучшить админку, уменьшить нагрузку на БД

**Что сделать:**
- Добавить `limit`, `offset`, `q` (поиск) и `status` (фильтр) для `/api/users`, `/api/resources`, `/api/bookings`
- Обновить админку для работы с пагинацией

**Код (пример):**
```javascript
// api.js — пример для users
app.get('/api/users', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const offset = parseInt(req.query.offset || '0', 10);
    const q = (req.query.q || '').trim();
    const params = [];
    let where = '';
    if (q) { params.push(`%${q}%`); where = `WHERE name ILIKE $${params.length} OR email ILIKE $${params.length}`; }
    params.push(limit, offset);
    const sql = `SELECT id, name, email, role_id, created_at FROM users ${where} ORDER BY id DESC LIMIT $${params.length-1} OFFSET $${params.length}`;
    const r = await con.query(sql, params);
    res.json(r.rows);
  } catch (err) { next(err); }
});

// Аналогично для resources и bookings (фильтр по status)
```

```javascript
// public/admin/admin.js — пример запроса с пагинацией
async function fetchUsers(page = 1, q = '') {
  const limit = 10;
  const offset = (page - 1) * limit;
  const url = `/api/users?limit=${limit}&offset=${offset}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data = await res.json();
  renderUsersTable(data);
}
```

**Чек-лист:**
- [ ] Реализовать пагинацию и фильтры на стороне API
- [ ] Обновить запросы в `public/admin/admin.js`
- [ ] Протестировать навигацию по страницам

---

**Последнее обновление:** 10 января 2026  
**Статус:** 🟡 В процессе  
**Приоритет:** 🔴 CRITICAL (блокирует остальное)
