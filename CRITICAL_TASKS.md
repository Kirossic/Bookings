# 🔴 КРИТИЧЕСКИЕ ЗАДАЧИ - БЫСТРЫЙ СТАРТ

**Прогресс проекта:** 47% завершено  
**Блокирующие задачи:** 4 критические работы  
**Примерное время:** 9-16 часов  
**Статус:** 🟢 Готово к началу

---

## 📋 TASK 1: GET/:id ENDPOINTS (2 часа)

**Что нужно сделать:**
Добавить endpoints для получения отдельных записей по ID

**Файл:** `api.js`

**Код для добавления:**
```javascript
// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT id, name, email, role_id, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/:id
app.get('/api/resources/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id
app.get('/api/bookings/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:id
app.get('/api/payments/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**Тестирование:**
```bash
# Получить пользователя с ID 1
curl http://localhost:3000/api/users/1 -H "Authorization: Bearer <TOKEN>"

# Получить ресурс с ID 1
curl http://localhost:3000/api/resources/1

# Получить бронирование с ID 1
curl http://localhost:3000/api/bookings/1 -H "Authorization: Bearer <TOKEN>"
```

**Чек-лист:**
- [ ] Добавить GET /api/users/:id
- [ ] Добавить GET /api/resources/:id
- [ ] Добавить GET /api/bookings/:id
- [ ] Добавить GET /api/payments/:id
- [ ] Протестировать каждый endpoint
- [ ] Обработать 404 ошибки

---

## 📋 TASK 2: PUT/:id ENDPOINTS (3-4 часа)

**Что нужно сделать:**
Добавить endpoints для редактирования записей (UPDATE операции)

**Файл:** `api.js`

**Код для добавления:**
```javascript
// PUT /api/users/:id
app.put('/api/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, role_id } = req.body;
  
  // Проверка прав: юзер может менять только свои данные (или админ)
  if (req.user.id !== parseInt(id) && req.user.role_id !== 3) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2, role_id = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, email, role_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/resources/:id
app.put('/api/resources/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, type, status, price_per_hour } = req.body;
  
  try {
    const result = await db.query(
      'UPDATE resources SET name = $1, description = $2, type = $3, status = $4, price_per_hour = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, description, type, status, price_per_hour, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id
app.put('/api/bookings/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await db.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**Тестирование:**
```bash
# Обновить пользователя
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"New Name","email":"new@example.com","role_id":1}'

# Обновить ресурс
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Room 101","status":"available","price_per_hour":100}'

# Обновить бронирование (статус)
curl -X PUT http://localhost:3000/api/bookings/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status":"confirmed"}'
```

**Чек-лист:**
- [ ] Добавить PUT /api/users/:id с проверкой прав
- [ ] Добавить PUT /api/resources/:id
- [ ] Добавить PUT /api/bookings/:id (статус)
- [ ] Добавить проверку прав (401, 403 ошибки)
- [ ] Добавить обработку 404 ошибок
- [ ] Протестировать каждый endpoint

---

## 📋 TASK 3: ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ (2-3 часа)

**Что нужно сделать:**
Создать middleware для валидации данных перед обработкой

**Файл:** `middleware/validators.js` (новый файл)

**Код:**
```javascript
// middleware/validators.js

const validators = {
  // Валидация email
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Валидация пароля (минимум 8 символов)
  password: (password) => {
    return password && password.length >= 8;
  },

  // Валидация имени (не пусто, не короче 2 символов)
  name: (name) => {
    return name && name.length >= 2 && name.length <= 100;
  },

  // Валидация цены (число > 0)
  price: (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
  },

  // Валидация дат
  date: (date) => {
    return !isNaN(Date.parse(date));
  },

  // Валидация диапазона дат
  dateRange: (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return start < end;
  }
};

// Middleware для проверки регистрации
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !validators.name(name)) {
    return res.status(400).json({ error: 'Invalid name (2-100 characters)' });
  }

  if (!email || !validators.email(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!password || !validators.password(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  next();
};

// Middleware для проверки ресурса
const validateResource = (req, res, next) => {
  const { name, price_per_hour } = req.body;

  if (!name || !validators.name(name)) {
    return res.status(400).json({ error: 'Invalid resource name' });
  }

  if (!validators.price(price_per_hour)) {
    return res.status(400).json({ error: 'Invalid price (must be > 0)' });
  }

  next();
};

// Middleware для проверки бронирования
const validateBooking = (req, res, next) => {
  const { start_time, end_time } = req.body;

  if (!validators.date(start_time) || !validators.date(end_time)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  if (!validators.dateRange(start_time, end_time)) {
    return res.status(400).json({ error: 'Start time must be before end time' });
  }

  next();
};

module.exports = {
  validators,
  validateRegister,
  validateResource,
  validateBooking
};
```

**Использование в api.js:**
```javascript
const { validateRegister, validateResource, validateBooking } = require('./middleware/validators');

// Применить валидацию
app.post('/api/users', validateRegister, async (req, res) => { ... });
app.post('/api/resources', verifyToken, validateResource, async (req, res) => { ... });
app.post('/api/bookings', verifyToken, validateBooking, async (req, res) => { ... });
app.put('/api/users/:id', verifyToken, validateRegister, async (req, res) => { ... });
```

**Чек-лист:**
- [ ] Создать middleware/validators.js
- [ ] Добавить email валидацию
- [ ] Добавить пароль валидацию
- [ ] Добавить цена валидацию
- [ ] Добавить дата валидацию
- [ ] Применить к POST /api/users
- [ ] Применить к POST /api/resources
- [ ] Применить к POST /api/bookings
- [ ] Протестировать с невалидными данными

---

## 📋 TASK 4: ОБРАБОТКА ОШИБОК (2-3 часа)

**Что нужно сделать:**
Создать centralized error handler для унификации обработки ошибок

**Файл:** `middleware/errorHandler.js` (новый файл)

**Код:**
```javascript
// middleware/errorHandler.js

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Middleware для обработки ошибок
const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    status: status,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  ApiError,
  errorHandler
};
```

**Использование в api.js:**
```javascript
const { ApiError, errorHandler } = require('./middleware/errorHandler');

// Обновить endpoints для использования ApiError
app.post('/api/login', async (req, res, next) => {
  try {
    // ... код логина
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
  } catch (err) {
    next(err); // Передать ошибку в errorHandler
  }
});

// В конце server.js добавить:
app.use(errorHandler);
```

**Чек-лист:**
- [ ] Создать middleware/errorHandler.js
- [ ] Создать ApiError класс
- [ ] Добавить errorHandler middleware в server.js
- [ ] Обновить все endpoints для использования try-catch
- [ ] Заменить res.status().json({ error }) на throw new ApiError()
- [ ] Протестировать обработку 400, 401, 403, 404, 500 ошибок

---

## 🎯 ПОРЯДОК ВЫПОЛНЕНИЯ

1. **СНАЧАЛА TASK 1** (GET/:id) - 2 часа - проще всего
2. **ПОТОМ TASK 2** (PUT/:id) - 3-4 часа - сложнее
3. **ПОТОМ TASK 3** (Валидация) - 2-3 часа - применить к существующим endpoints
4. **ПОТОМ TASK 4** (Error Handler) - 2-3 часа - рефакторинг

**Общее время:** 9-16 часов  
**Эстимировано:** Неделя (если 2-3 часа в день)

---

## ✅ РЕЗУЛЬТАТ ПОСЛЕ ВЫПОЛНЕНИЯ

- ✅ Админка сможет редактировать записи (showEditForm будет работать)
- ✅ API будет защищен от невалидных данных
- ✅ Ошибки будут обрабатываться единообразно
- ✅ Месяц 2 будет завершен на 100%
- ✅ Может быть начат Месяц 3 (Stripe, Email)

---

**Последнее обновление:** 2 января 2026  
**Статус:** 🟢 Готово к началу  
**Приоритет:** 🔴 CRITICAL (блокирует остальное)
