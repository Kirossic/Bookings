# 🚀 Быстрый старт - JWT аутентификация

## ✅ Что реализовано

- ✨ **Полная JWT аутентификация** (регистрация, вход, выход)
- 🔒 **Хеширование паролей** через bcryptjs
- 🛡️ **Защита маршрутов** - автоматическая проверка токенов
- 👥 **Роль-основанный доступ** - разделение прав админов и пользователей
- 📦 **Общий модуль auth.js** - централизованная работа с JWT на фронтенде
- 🔄 **Автоматический редирект** при истечении токена
- ✅ **GET/:id endpoints** - получение отдельных записей (users, resources, bookings, payments, logs, roles)
- ✅ **PATCH/:id endpoints** - обновление записей с валидацией
- ✅ **Валидация входных данных** - middleware для email, пароль, цены, дат
- ✅ **Centralized error handler** - унифицированная обработка ошибок через ApiError

## 📁 Файлы изменены/созданы

### Backend
- `backend/hashing.js` - хеширование паролей (bcryptjs)
- `backend/Verify_Token.js` - middleware проверки токенов
- `api.js` - обновлён: GET/:id, PATCH/:id, DELETE, валидаторы, errorHandler
- `server.js` - POST эндпоинты (пользователи, ресурсы, бронирования)
- `middleware/validators.js` - валидация email, пароль, цены, дат
- `middleware/errorHandler.js` - ApiError класс и centralized error handler

### Frontend
- **`public/js/auth.js`** ⭐ - главный модуль для работы с JWT
- `public/js/nav.js` - навигация с отображением пользователя
- `public/admin/admin.js` - роль-проверка и auth.authFetch
- `public/Buking/home/script.js` - защита бронирования
- `public/Buking/home/booking.js` - использование currentUser из auth
- `public/Buking/sign_in/script.js` - сохранение через auth.login()

### HTML (добавлен скрипт auth.js)
- `public/admin/admin.html`
- `public/Buking/home/index.html`
- `public/Buking/home/booking.html`
- `public/Buking/sign_in/index.html`

### Документация
- **`JWT_AUTH_README.md`** - полная документация

## 🎯 Как использовать

### 1. Вход пользователя

```javascript
// В public/Buking/sign_in/script.js (уже реализовано)
const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});
const data = await res.json();
if (res.ok) {
    auth.login(data.token, data.user); // Сохранить в localStorage
    window.location.href = '../home/index.html';
}
```

### 2. Защита страницы

```javascript
// В начале любого скрипта, требующего авторизацию
if (!auth.requireAuth('../sign_in/index.html')) {
    // Остановить выполнение
}
```

### 3. Защита по роли (для админки)

```javascript
// Только для администраторов (role_id = 1)
if (!auth.requireRole(1, '../Buking/sign_in/index.html')) {
    return;
}
```

### 4. Защищённые API запросы

```javascript
// Используйте auth.authFetch вместо обычного fetch
const res = await auth.authFetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
});
```

### 5. Выход

```javascript
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
    window.location.href = '../sign_in/index.html';
});
```

## 🔑 API Endpoints

### Публичные
- `POST /api/users` - регистрация
- `POST /api/login` - вход (получение токена)
- `GET /api/resources` - список ресурсов

### Защищённые (требуют Authorization: Bearer {token})
- `GET /api/users` - пользователи
- `GET /api/bookings` - бронирования
- `GET /api/payments` - платежи
- `GET /api/logs` - логи
- `POST /api/resources` - создать ресурс
- `POST /api/bookings` - создать бронирование
- `PATCH /api/resources/:id` - обновить ресурс
- `DELETE /api/*` - удалить запись

## 🧪 Тестирование

### Регистрация
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

### Вход
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```
**Ответ:** `{"token":"eyJhbGc...","user":{...}}`

### Защищённый запрос
```bash
TOKEN="ваш_токен_из_логина"
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

### Без токена (должна быть ошибка 401)
```bash
curl -X GET http://localhost:3000/api/bookings
# {"error":"Токен отсутствует"}
```

## 🎨 Auth модуль - API

```javascript
// Проверки
auth.isAuthenticated()          // true/false
auth.getToken()                 // 'eyJhbGc...'
auth.getUser()                  // {id, name, email, role_id}
auth.hasRole(3)                 // true если админ

// Действия
auth.login(token, user)         // Сохранить токен и пользователя
auth.logout()                   // Очистить всё

// Защита
auth.requireAuth(redirectUrl)   // Защита страницы
auth.requireRole(roleId, url)   // Защита по роли

// Запросы
auth.authFetch(url, options)    // fetch с автоматическим токеном
auth.getAuthHeaders(headers)    // Получить заголовки
```

## 📊 Структура ролей

- `role_id = 1` - Пользователь (по умолчанию)
- `role_id = 2` - Модератор
- `role_id = 3` - Администратор (доступ к /admin)

## 🔒 Безопасность

- ✅ Пароли хешируются bcryptjs (10 раундов)
- ✅ JWT токен живёт 24 часа
- ✅ Секрет в `process.env.JWT_SECRET`
- ✅ Middleware проверяет все защищённые маршруты
- ✅ Автоматический логаут при 401/403

## 🚀 Запуск

```bash
# Установить зависимости (если ещё не установлены)
npm install

# Запустить сервер
node server.js

# Открыть в браузере
http://localhost:3000/index
```

## 📝 Проверочный список

- [x] Backend: хеширование паролей
- [x] Backend: JWT токены на 24 часа
- [x] Backend: защита маршрутов через verifyToken
- [x] Frontend: модуль auth.js
- [x] Frontend: защита страниц (редирект)
- [x] Frontend: роль-проверка для админки
- [x] Frontend: auth.authFetch для всех запросов
- [x] Тестирование: регистрация ✅
- [x] Тестирование: вход ✅
- [x] Тестирование: защищённые endpoints ✅
- [x] Тестирование: 401 без токена ✅
- [x] Документация: JWT_AUTH_README.md

## 🎓 Дополнительно

Полная документация: **`JWT_AUTH_README.md`**

## 💡 Советы

1. **Всегда используйте `auth.authFetch()`** вместо обычного `fetch()` для защищённых запросов
2. **Защищайте страницы** через `auth.requireAuth()` в начале скрипта
3. **Для админ-страниц** используйте `auth.requireRole(1)`
4. **При логине** используйте `auth.login(token, user)` вместо прямой работы с localStorage
5. **При логауте** используйте `auth.logout()` для очистки всех данных

---

**✨ JWT аутентификация полностью интегрирована и готова к использованию!**
