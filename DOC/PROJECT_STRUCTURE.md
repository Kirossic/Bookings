# 🗂️ СТРУКТУРА ПРОЕКТА И НАВИГАЦИЯ

## 📁 Структура папок проекта

```
Bukings/
├── api.js
├── main.js
├── package.json
├── README.md
├── server.js
├── Untitled.sql
├── backend/
│   ├── hashing.js
│   └── verifyToken.js
├── db_local/
│   ├── db.js
│   └── migrate.js
├── DOC/
│   ├── CODE_TEMPLATES.md
│   ├── CRITICAL_TASKS.md
│   ├── DOCUMENTATION_INDEX.md
│   ├── ERD_DIAGRAM.md
│   ├── FINAL_REPORT.md
│   ├── JWT_AUTH_README.md
│   ├── JWT_QUICKSTART.md
│   ├── PROJECT_CHECKLIST.md
│   ├── PROJECT_STRUCTURE.md
│   └── UPDATES_SUMMARY.md
├── middleware/
│   ├── errorHandler.js
│   └── validators.js
├── public/
│   ├── index.html
│   ├── admin/
│   │   ├── admin.css
│   │   ├── admin.html
│   │   └── admin.js
│   ├── Buking/
│   │   ├── home/
│   │   │   ├── booking.html
│   │   │   ├── booking.js
│   │   │   ├── index.html
│   │   │   ├── script.js
│   │   │   └── style.css
│   │   ├── sign_in/
│   │   │   ├── index.html
│   │   │   ├── script.js
│   │   │   └── style.css
│   │   └── sign_up/
│   │       ├── index.html
│   │       ├── script.js
│   │       └── style.css
│   └── js/
│       ├── auth.js
│       └── nav.js
```

---

## 📊 СТАТУС ОСНОВНЫХ КОМПОНЕНТОВ

- server.js: ✅ работает, требуется централизованная обработка ошибок
- api.js: ✅ базовые GET/POST/DELETE реализованы; ⏳ добавить GET/:id и PUT/:id
- backend/verifyToken.js: ✅ JWT проверка
- backend/hashing.js: ✅ хеширование паролей (bcryptjs)
- public/js/auth.js: ✅ модуль аутентификации
- public/admin/*: ✅ базовая админка (Vanilla JS), ⏳ требуется редактирование/фильтры/пагинация
- db_local/db.js: ✅ подключение к PostgreSQL
- middleware/*: ⏳ вынести валидацию и error handler

---

## 🎯 ПРИОРИТИЗИРОВАННЫЕ ЗАДАЧИ

### 🔴 КРИТИЧНЫЕ (Неделя 1-2)

1. **Создать SQL миграции** (`db/migrations/*.sql`)
   - V001: Создание всех таблиц
   - V002: Добавление индексов
   - V003: Добавление триггеров
   
2. **Завершить CRUD API**
   - PUT/DELETE endpoints для всех сущностей
   - Валидация входных данных
   - Обработка ошибок (400, 401, 403, 404)

3. **Настроить обработку ошибок**
   - Создать `middleware/errorHandler.js`
   - Централизованная обработка ошибок
   - Логирование во все endpoints

### 🟠 ВАЖНЫЕ (Неделя 3-4)

4. **Написать тесты**
   - Unit тесты для утилит
   - Integration тесты для API
   - Минимум 80% покрытие

5. **Интегрировать Stripe**
   - Создать endpoint `POST /api/payments`
   - Webhook обработчик
   - Обновление статусов платежей

6. **Настроить Redis очереди**
   - Установить Bull
   - Email очередь
   - Worker для обработки

### 🟡 НОРМАЛЬНЫЕ (Неделя 5-6)

7. **Docker и docker-compose**
   - Dockerfile для Node.js
   - docker-compose.yml
   - Локальное тестирование

8. **VPS деплой**
   - Заказать VPS
   - Установить Docker
   - Настроить Nginx

9. **CI/CD pipeline**
   - GitHub Actions workflow
   - Автоматические тесты
   - Автоматический деплой

### 🟢 ОПЦИОНАЛЬНЫЕ (Неделя 7-8)

10. **React админка**
    - Создать приложение
    - Таблицы и формы
    - Графики и статистика

11. **Оптимизация БД**
    - EXPLAIN ANALYZE
    - Индексирование
    - Кэширование Redis

12. **Мониторинг и логирование**
    - Prometheus метрики
    - Grafana дашборды
    - Loki/ELK логи

---

## 📚 ДОКУМЕНТАЦИЯ ПО ФАЙЛАМ

### Backend (`backend/`)

#### `hashing.js` ✅
```javascript
// Функции для хеширования паролей
hashPassword(password)      // Создать хеш
comparePassword(password, hash) // Проверить пароль
```

#### `verifyToken.js` ✅
```javascript
// Middleware для проверки JWT
verifyToken(req, res, next) // Проверить токен в Authorization header
```

### API Routes (`api.js` & `server.js`)

#### Authentication
- `POST /api/auth/register` ✅ - Регистрация
- `POST /api/auth/login` ✅ - Вход

#### Users
- `GET /api/users` ✅ - Список пользователей
- `GET /api/users/:id` ⏳ - Получить пользователя
- `PUT /api/users/:id` ⏳ - Обновить пользователя
- `DELETE /api/users/:id` ⏳ - Удалить пользователя

#### Resources
- `GET /api/resources` ✅ - Список ресурсов
- `GET /api/resources/:id` ⏳ - Получить ресурс
- `POST /api/resources` ✅ - Создать ресурс (админ)
- `PATCH /api/resources/:id` ✅ - Обновить статус
- `DELETE /api/resources/:id` ✅ - Удалить ресурс (админ)

#### Bookings
- `GET /api/bookings` ✅ - Мои бронирования
- `GET /api/bookings/:id` ⏳ - Детали бронирования
- `POST /api/bookings` ✅ - Создать бронирование
- `PUT /api/bookings/:id` ⏳ - Обновить статус
- `DELETE /api/bookings/:id` ✅ - Отменить бронирование

#### Payments
- `GET /api/payments` ⏳ - Список платежей
- `POST /api/payments` ⏳ - Создать платёж (Stripe)
- `POST /api/webhooks/stripe` ⏳ - Webhook Stripe

#### Analytics (⏳ новое)
- `GET /api/analytics/revenue-by-month` - Доходы по месяцам
- `GET /api/analytics/bookings-by-status` - Бронирования по статусам
- `GET /api/analytics/resource-utilization` - Использование ресурсов

### Frontend (`public/`)

#### `js/auth.js` ✅ - Главный модуль JWT
```javascript
auth.login(token, user)           // Сохранить токен
auth.logout()                      // Очистить токен
auth.requireAuth(redirectUrl)      // Защита страницы
auth.requireRole(roleId, url)      // Защита по роли
auth.authFetch(url, options)       // Fetch с токеном
```

#### `Buking/home/script.js` ✅
- Загрузка ресурсов
- Обработка клика на бронирование

#### `Buking/home/booking.js` ✅
- Форма бронирования
- Создание брони через API
- Обновление статуса ресурса

#### `Buking/sign_in/script.js` ✅
- Вход пользователя
- Получение JWT токена
- Сохранение в localStorage

#### `Buking/sign_up/script.js` ⏳
- Регистрация пользователя
- Валидация формы

#### `admin/admin.js` ✅ (70%)
- Управление пользователями
- Управление ресурсами
- Управление бронированиями
- Управление платежами

---

## 🔗 ВЗАИМОСВЯЗИ МЕЖДУ МОДУЛЯМИ

```
┌─────────────────────────────────────────────────────────────┐
│                     КЛИЕНТ (БРАУЗЕР)                        │
├─────────────────────────────────────────────────────────────┤
│  public/js/auth.js ◄────────────────────────────────────────┤ Управляет токеном
│       │                                                      │
│       ├─► Buking/sign_in/script.js     (вход, получение токена)
│       ├─► Buking/home/script.js        (загрузка ресурсов)
│       ├─► Buking/home/booking.js       (создание брони)
│       └─► admin/admin.js               (управление системой)
│
└──────────────────────┬──────────────────────────────────────┘
                       │ fetch/HTTP
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                           │
├─────────────────────────────────────────────────────────────┤
│  server.js / api.js                                         │
│       │                                                      │
│       ├─► POST /api/auth/login                             │
│       ├─► GET /api/resources                               │
│       ├─► POST /api/bookings ────────────────────┐          │
│       ├─► POST /api/payments                    │          │
│       ├─► DELETE /api/bookings/:id              │          │
│       │                                          │          │
│       └─► Middleware:                           │          │
│           - verifyToken                         │          │
│           - errorHandler                        │          │
│           - logging                             │          │
│                                                  │          │
│  backend/hashing.js                             │          │
│  backend/verifyToken.js                        │          │
│                                                  │          │
└──────────────────────┬──────────────────────────┼───────────┘
                       │ SQL запросы  │ очереди
                       ▼              │
        ┌──────────────────────┐     │
        │   PostgreSQL БД      │     │
        │                      │     │
        │ - users              │     │
        │ - resources          │     │
        │ - bookings           │     │ ┌──────────────┐
        │ - payments           │     └─►│ Redis Queue  │
        │ - logs               │        │ (Bull)       │
        │ - roles              │        │ - email      │
        │                      │        │ - SMS        │
        └──────────────────────┘        └──────────────┘
                                            │
                                            ▼
                                        Nodemailer
                                        (отправка email)
```

---

## 💡 СОВЕТЫ ПО РАЗРАБОТКЕ

### Как добавить новый endpoint

1. **Создать маршрут в `server.js` или `api.js`**
   ```javascript
   app.post('/api/new-route', verifyToken, async (req, res) => {
     // валидация
     // бизнес-логика
     // ответ
   });
   ```

2. **Добавить миграцию в `db/migrations/`** (если нужны таблицы)
   ```sql
   -- db/migrations/V00X__Add_new_table.sql
   CREATE TABLE new_table (
     id SERIAL PRIMARY KEY,
     ...
   );
   ```

3. **Написать тест в `tests/new-route.test.js`**
   ```javascript
   describe('New Route', () => {
     it('should work', async () => {
       const res = await request(app).post('/api/new-route');
       expect(res.status).toBe(200);
     });
   });
   ```

4. **Обновить документацию** в PROJECT_CHECKLIST.md

### Как протестировать API

```bash
# Без токена (публичный)
curl http://localhost:3000/api/resources

# С токеном (защищённый)
TOKEN="your_token_here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/bookings

# POST запрос
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"resource_id": 1, "start_time": "2026-01-15T10:00:00", "end_time": "2026-01-15T12:00:00"}'
```

### Как запустить проект локально

```bash
# 1. Установить зависимости
npm install

# 2. Создать .env файл
cp .env.example .env

# 3. Запустить БД (если используется Docker)
docker-compose up -d postgres redis

# 4. Запустить миграции
npm run migrate

# 5. Запустить сервер
npm run dev
```

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

1. **Создать SQL миграции** → Прочитайте `db/migrations/*.sql`
2. **Написать тесты** → Смотрите `tests/`
3. **Настроить Docker** → Создайте `docker/Dockerfile`
4. **Создать админку** → Начните с `admin/src/pages/Users.jsx`
5. **Развернуть на VPS** → Следуйте гайду DevOps в PROJECT_CHECKLIST.md

---

**Версия:** 1.0  
**Последнее обновление:** 2 января 2026
