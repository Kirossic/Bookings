# JWT Аутентификация - Документация

## Обзор

В проект интегрирована полная JWT (JSON Web Token) аутентификация с хешированием паролей через bcryptjs.

## Архитектура

### Backend (Node.js + Express)

#### Модули
- **`backend/hashing.js`** - утилиты для хеширования паролей (bcryptjs)
- **`backend/Verify_Token.js`** - middleware для проверки JWT токенов
- **`api.js`** - API endpoints с защитой токенами
- **`server.js`** - основные маршруты регистрации и управления

#### API Endpoints

##### Публичные (без токена)
- `POST /api/users` - регистрация нового пользователя
  ```json
  {
    "name": "Иван",
    "email": "ivan@example.com",
    "password": "mypassword123"
  }
  ```

- `POST /api/login` - вход пользователя, получение JWT токена
  ```json
  {
    "email": "ivan@example.com",
    "password": "mypassword123"
  }
  ```
  **Ответ:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Иван",
      "email": "ivan@example.com",
      "role_id": 1
    }
  }
  ```

- `GET /api/resources` - получить список ресурсов

##### Защищённые (требуют токен)

**GET (чтение):**
- `GET /api/users` - список пользователей (с пагинацией: ?limit=10&offset=0&q=...)
- `GET /api/users/:id` - получить пользователя по ID
- `GET /api/resources` - список ресурсов
- `GET /api/resources/:id` - получить ресурс по ID
- `GET /api/bookings` - список бронирований
- `GET /api/bookings/:id` - получить бронирование по ID
- `GET /api/roles` - список ролей
- `GET /api/roles/:id` - получить роль по ID
- `GET /api/payments` - список платежей
- `GET /api/payments/:id` - получить платёж по ID
- `GET /api/logs` - логи действий
- `GET /api/logs/:id` - получить лог по ID

**POST (создание):**
- `POST /api/resources` - создать ресурс (валидация: validateResource)
- `POST /api/bookings` - создать бронирование (валидация: validateBooking)

**PATCH (обновление):**
- `PATCH /api/users/:id` - обновить пользователя (валидация: validateRegister)
- `PATCH /api/resources/:id` - обновить ресурс (валидация: validateResource)
- `PATCH /api/bookings/:id` - обновить бронирование (валидация: validateBooking)
- `PATCH /api/roles/:id` - обновить роль
- `PATCH /api/payments/:id` - обновить платёж
- `PATCH /api/logs/:id` - обновить лог

**DELETE (удаление):**
- `DELETE /api/bookings/:id` - удалить бронирование
- `DELETE /api/users/:id` - удалить пользователя (requireRole: [3])
- `DELETE /api/resources/:id` - удалить ресурс (requireRole: [3])

**Заголовок для защищённых запросов:**
```
Authorization: Bearer {your_token_here}
```

#### Валидация

Для POST/PATCH запросов используются middleware валидаторы:
- `validateRegister` - проверяет name, email, password для users
- `validateResource` - проверяет name, price_per_hour для resources
- `validateBooking` - проверяет start_time, end_time, диапазон дат для bookings

**Примеры ошибок валидации:**
```json
{
  "error": "Invalid email format",
  "status": 400,
  "timestamp": "2026-01-10T10:30:00.000Z"
}
```

#### Ошибки и HTTP коды

- `400` - невалидные данные (используется ApiError)
- `401` - неверные учётные данные или истёк токен
- `403` - доступ запрещён (insufficent role)
- `404` - ресурс не найден
- `500` - ошибка сервера

### Frontend (Vanilla JS)

#### Модуль Auth (`public/js/auth.js`)

Центральный модуль для работы с JWT на фронтенде.

##### Основные методы

```javascript
// Проверка авторизации
auth.isAuthenticated() // true/false

// Получить токен
auth.getToken() // 'eyJhbGciOiJIUzI1NiI...'

// Получить пользователя
auth.getUser() // { id: 1, name: 'Иван', email: 'ivan@...', role_id: 3 }

// Вход (после успешного /api/login)
auth.login(token, user)

// Выход
auth.logout()

// Получить заголовки с авторизацией
auth.getAuthHeaders({ 'Content-Type': 'application/json' })

// Проверка роли
auth.hasRole(3) // true если пользователь администратор

// Защита страницы (редирект если не авторизован)
auth.requireAuth('/sign_in/index.html')

// Защита по роли
auth.requireRole(3, '/sign_in/index.html') // только для админов

// Универсальный fetch с автоматическими заголовками
const res = await auth.authFetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

#### Использование в скриптах

##### 1. Подключение модуля
Добавьте в HTML перед вашим скриптом:
```html
<script src="../js/auth.js"></script>
<script src="your-script.js"></script>
```

##### 2. Защита страницы
```javascript
// В начале вашего скрипта
if (!auth.requireAuth('../sign_in/index.html')) {
    // Остановить выполнение если нет доступа
}
```

##### 3. Защита по роли (для админ-панели)
```javascript
// Проверить что пользователь администратор (role_id = 1)
if (!auth.requireRole(3, '../Buking/sign_in/index.html')) {
    return;
}
```

##### 4. Выполнение защищённых запросов
```javascript
// Вместо обычного fetch
const res = await auth.authFetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 1, resource_id: 5, ... })
});
```

##### 5. Логин
```javascript
const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});
const data = await res.json();
if (res.ok) {
    auth.login(data.token, data.user);
    window.location.href = '../home/index.html';
}
```

##### 6. Логаут
```javascript
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
    window.location.href = '../sign_in/index.html';
});
```

## Структура ролей

В базе данных используется таблица `roles`:
- **role_id = 1**: Обычный пользователь (по умолчанию при регистрации)
- **role_id = 2**: Модератор или меноджер
- **role_id = 3**: Администратор (полный доступ)

## Безопасность

### Backend
- ✅ Пароли хешируются через `bcryptjs` (salt rounds = 10)
- ✅ JWT токены с временем жизни 24 часа
- ✅ Секретный ключ в `process.env.JWT_SECRET` (или дефолтный '789456123')
- ✅ Middleware `verifyToken` проверяет все защищённые маршруты
- ✅ `GET /api/users` возвращает только безопасные поля (без password_hash)

### Frontend
- ✅ Токен хранится в `localStorage`
- ✅ Автоматический редирект при истечении токена (401/403)
- ✅ Проверка роли для доступа к админ-панели
- ✅ Централизованное управление auth через модуль

## Настройка переменных окружения

Создайте файл `.env`:
```env
JWT_SECRET=your_super_secret_key_here_change_me
DB_HOST=localhost
```

Установите зависимости:
```bash
npm install
```

## Тестирование

### Регистрация
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","email":"test@test.com","password":"123456"}'
```

### Вход
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### Защищённый запрос
```bash
TOKEN="your_token_from_login"
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

## Обработка ошибок

### 401 Unauthorized
- Токен отсутствует или неверный формат
- Действие: редирект на страницу входа

### 403 Forbidden
- Токен истёк или недействителен
- Действие: очистка localStorage, редирект на вход

### 400 Bad Request
- Неполные данные в запросе
- Действие: показать сообщение пользователю

## Дальнейшие улучшения

- [ ] Refresh токены для автопродления сессии
- [ ] Rate limiting для защиты от брутфорса
- [ ] Логирование попыток входа
- [ ] 2FA (двухфакторная аутентификация)
- [ ] Восстановление пароля через email
- [ ] Blacklist для отозванных токенов

## Поддержка

При возникновении проблем проверьте:
1. Токен сохранён в localStorage
2. Токен не истёк (срок действия 24 часа)
3. Правильный формат заголовка Authorization
4. Сервер запущен и база данных доступна
