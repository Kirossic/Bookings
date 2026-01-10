# 🟢 ВЫПОЛНЕННЫЕ ЗАДАЧИ

**Прогресс проекта:** 47% завершено  
**Последнее обновление:** 10 января 2026

---

## ✅ TASK 1: GET/:id ENDPOINTS

**Статус:** Выполнено в `api.js`

**Покрытие:**
- GET `/api/users/:id` (verifyToken)
- GET `/api/resources/:id` (verifyToken)
- GET `/api/bookings/:id` (verifyToken)
- GET `/api/roles/:id` (verifyToken)
- GET `/api/payments/:id` (verifyToken)
- GET `/api/logs/:id` (verifyToken)

**Пример тестирования:**
```bash
# Логин → получить токен
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jwttest@test.com","password":"password123"}' | jq -r .token)

# Получить пользователя с ID 1
curl -s http://localhost:3000/api/users/1 -H "Authorization: Bearer $TOKEN"

# Получить ресурс с ID 1
curl -s http://localhost:3000/api/resources/1 -H "Authorization: Bearer $TOKEN"

# Получить бронирование с ID 1
curl -s http://localhost:3000/api/bookings/1 -H "Authorization: Bearer $TOKEN"
```

---

## ✅ TASK 2: UPDATE ENDPOINTS (реализовано как PATCH)

**Статус:** Выполнено в `api.js`

**Покрытие:**
- PATCH `/api/users/:id` (verifyToken, `validateRegister`)
- PATCH `/api/resources/:id` (verifyToken, `validateResource`)
- PATCH `/api/bookings/:id` (verifyToken, `validateBooking`)
- Также реализованы PATCH для: `/api/roles/:id`, `/api/payments/:id`, `/api/logs/:id`

**Пример тестирования:**
```bash
# Обновить пользователя
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"New Name","email":"new@example.com","role_id":1}'

# Обновить ресурс
curl -X PATCH http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Room 101","status":"available","price_per_hour":100}'

# Обновить бронирование
curl -X PATCH http://localhost:3000/api/bookings/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"confirmed"}'
```
