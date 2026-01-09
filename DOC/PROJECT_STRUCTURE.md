# 🗂️ СТРУКТУРА ПРОЕКТА И НАВИГАЦИЯ

## 📁 Структура папок проекта

```
bukings/
├── 📄 README.md                     # Основная документация
├── 📄 PROJECT_CHECKLIST.md          # ⭐ ПОЛНЫЙ ПЛАН ПРОЕКТА
├── 📄 ERD_DIAGRAM.md                # ⭐ ДИАГРАММА БД
├── 📄 JWT_AUTH_README.md            # Документация JWT
├── 📄 JWT_QUICKSTART.md             # Быстрый старт JWT
├── 
├── 📁 backend/                      # Backend код
│   ├── hashing.js                   # Хеширование паролей (bcryptjs)
│   ├── Verify_Token.js              # Проверка JWT токенов
│   └── [новые модули будут здесь]
├──
├── 📁 db/                           # База данных
│   ├── migrations/
│   │   ├── V001__Create_tables.sql       # ✅ Нужна: таблицы
│   │   ├── V002__Add_indexes.sql         # ✅ Нужна: индексы
│   │   └── V003__Add_triggers.sql        # ✅ Нужна: триггеры
│   ├── db.js                            # Подключение к БД
│   ├── migrate.js                       # Flyway миграции
│   └── examples.sql                     # Примеры запросов
├──
├── 📁 public/                       # Frontend код
│   ├── 📁 js/
│   │   ├── auth.js                  # ✅ Модуль JWT на фронте
│   │   └── nav.js                   # Навигация
│   ├── 📁 Buking/
│   │   ├── 📁 home/
│   │   │   ├── index.html           # Главная страница
│   │   │   ├── script.js            # ✅ Логика с JWT
│   │   │   ├── booking.html         # Страница бронирования
│   │   │   └── booking.js           # ✅ Логика бронирования
│   │   ├── 📁 sign_in/
│   │   │   ├── index.html
│   │   │   └── script.js            # ✅ Вход с JWT
│   │   └── 📁 sign_up/
│   │       ├── index.html
│   │       └── script.js            # Регистрация
│   └── 📁 admin/                    # ✅ Требует разработки
│       ├── admin.html
│       ├── admin.js                 # С проверкой роли
│       └── admin.css
├──
├── 📁 tests/                        # ⏳ Нужны тесты
│   ├── auth.test.js
│   ├── bookings.test.js
│   └── resources.test.js
├──
├── 📁 config/                       # Конфигурация
│   ├── database.js                  # ✅ Есть
│   └── environment.js               # ⏳ Нужна
├──
├── 📁 middleware/                   # ⏳ Нужно расширить
│   ├── errorHandler.js              # ⏳ Обработка ошибок
│   ├── validate.js                  # ⏳ Валидация
│   └── rateLimit.js                 # ⏳ Rate limiting
├──
├── 📁 routes/                       # ⏳ Структурировать
│   ├── auth.js                      # ⏳ Маршруты аутентификации
│   ├── users.js                     # ⏳ CRUD пользователей
│   ├── resources.js                 # ⏳ CRUD ресурсов
│   ├── bookings.js                  # ⏳ CRUD бронирований
│   └── payments.js                  # ⏳ Платежи (Stripe)
├──
├── 📁 .github/                      # ⏳ GitHub Actions
│   └── workflows/
│       ├── test.yml                 # ⏳ Тестирование
│       └── deploy.yml               # ⏳ Деплой
├──
├── 📁 docker/                       # ⏳ Docker конфигурация
│   ├── Dockerfile                   # ⏳ Docker образ
│   └── docker-compose.yml           # ⏳ Сервисы
├──
├── 📁 admin/                        # ⏳ React админка
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Users.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── Bookings.jsx
│   │   │   └── Analytics.jsx
│   │   └── components/
│   │       ├── Table.jsx
│   │       ├── Form.jsx
│   │       └── Chart.jsx
│   └── package.json
├──
├── 📄 .env.example                  # Пример переменных
├── 📄 .gitignore                    # ✅ Git ignore
├── 📄 package.json                  # ✅ Зависимости
├── 📄 package-lock.json             # ✅ Lock файл
├── 📄 server.js                     # ✅ Основной сервер
├── 📄 api.js                        # ✅ API routes
└── 📄 Untitled.sql                  # ⏳ Убрать / использовать
```

---

## 📊 СТАТУС ФАЙЛОВ

| Файл | Статус | Дополнительно |
|------|--------|---------------|
| server.js | ✅ 60% | Нужны PUT/DELETE, обработка ошибок |
| api.js | ✅ 60% | Нужны PUT/DELETE для всех сущностей |
| backend/hashing.js | ✅ 100% | Готово |
| backend/Verify_Token.js | ✅ 100% | Готово |
| public/js/auth.js | ✅ 100% | Готово |
| public/admin/admin.js | ✅ 70% | Нужны доп. функции |
| public/Buking/home/script.js | ✅ 80% | Нужна оптимизация |
| public/Buking/home/booking.js | ✅ 80% | Нужна валидация |
| db/migrations/*.sql | ⏳ 0% | Нужно создать |
| tests/*.test.js | ⏳ 0% | Нужно написать |
| .github/workflows/*.yml | ⏳ 0% | Нужно настроить |
| docker/Dockerfile | ⏳ 0% | Нужно создать |
| admin/ (React) | ⏳ 0% | Нужно разработать |

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

#### `Verify_Token.js` ✅
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
│  backend/Verify_Token.js                        │          │
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
