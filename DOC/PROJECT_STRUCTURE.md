# 🗂️ СТРУКТУРА ПРОЕКТА И НАВИГАЦИЯ

**Обновлено:** 17 марта 2026  
**Статус архитектуры:** В процессе стабилизации

---

## 📁 Фактическая структура проекта

```text
Bukings/
├── backend/
│   ├── apiConstructor.js
│   ├── hashing.js
│   ├── verifyToken.js
│   └── src/
│       ├── api.js
│       ├── server.js
│       └── routes/
│           ├── index.js
│           ├── auth.routes.js
│           ├── user.routes.js
│           ├── resource.routes.js
│           ├── booking.routes.js
│           ├── payment.routes.js
│           ├── role.routes.js
│           └── log.routes.js
├── db/
│   ├── db.js
│   ├── migrate.js
│   ├── startTestDB.js
│   └── trigger.js
├── middleware/
│   ├── errorHandler.js
│   └── validators.js
├── public/
│   ├── admin/
│   │   ├── admin.html
│   │   ├── admin.js
│   │   └── admin.css
│   ├── Buking/
│   ├── js/
│   └── index.html
└── DOC/
    ├── PROJECT_CHECKLIST.md
    ├── CRITICAL_TASKS.md
    ├── FINAL_REPORT.md
    └── ...
```

---

## 🧭 Текущий поток backend

```text
server.js -> api.js -> routes/index.js -> domain routes
```

- `api.js`: инициализация приложения, `app.use('/api', indexRouter)`, `errorHandler`
- `server.js`: запуск сервера и раздача статики
- `routes/*.routes.js`: доменные маршруты и текущая бизнес-логика

---

## ✅ Что уже сделано

- Монолитный API разбит на доменные роуты
- Создан единый агрегатор роутов
- В `bookings` реализована проверка пересечения интервалов при создании
- Валидация подключена в ключевых `POST/PATCH` маршрутах
- Админка работает на Vanilla JS: список, добавление, удаление, редактирование

---

## ⚠️ Что требует доработки

1. `auth.routes.js` не интегрирован корректно в роут-агрегатор
2. Ошибки обрабатываются неравномерно (`throw` + `next` в одном блоке)
3. `errorHandler` подключается дважды (`api.js` и `server.js`)
4. Нет слоя `controllers/services/repositories`
5. Нет валидации `.env` на старте

---

## 🎯 Целевая архитектура (следующий этап)

```text
routes -> controllers -> services -> repositories -> db
```

- `routes`: только маршрутизация и middleware
- `controllers`: работа с HTTP-контекстом
- `services`: бизнес-правила
- `repositories`: SQL и доступ к данным

---

## 📌 Приоритет внедрения

1. Стабилизация текущего роут-слоя
2. Вынос авторизации в `auth.routes.js`
3. Нормализация обработки ошибок
4. Поэтапный вынос `users/resources/bookings` в слои
