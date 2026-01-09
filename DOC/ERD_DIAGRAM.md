```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                         ERD - ДИАГРАММА БАЗЫ ДАННЫХ BUKINGS                           ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

                                      ┌─────────────┐
                                      │    ROLES    │
                                      ├─────────────┤
                                      │ id (PK)     │
                                      │ name        │
                                      │ created_at  │
                                      └──────┬──────┘
                                             │
                                      ┌──────▼────────┐
                                      │ Связь 1-ко-М  │
                                      └────────────────┘

        ┌──────────────────────────────────────────────────────────────┐
        │                                                              │
        │                   ┌──────────────────┐                      │
        │                   │     USERS        │                      │
        │                   ├──────────────────┤                      │
        │                   │ id (PK)          │                      │
        │                   │ name             │                      │
        │                   │ email (UNIQUE)   │                      │
        │                   │ password_hash    │                      │
        │                   │ role_id (FK) ────┼──────────────────────┤
        │                   │ created_at       │
        │                   │ updated_at       │
        │                   └────────┬─────────┘
        │                            │
        │     ┌──────────────────────┼─────────────────────┐
        │     │                      │                     │
        │     │              ┌───────▼────────┐     ┌──────▼────────┐
        │     │              │   BOOKINGS     │     │    LOGS       │
        │     │              ├────────────────┤     ├───────────────┤
        │     │              │ id (PK)        │     │ id (PK)       │
        │     │              │ user_id (FK)   │     │ user_id (FK)  │
        │     │              │ resource_id(FK)│     │ action        │
        │     │              │ start_time     │     │ details (JSON)│
        │     │              │ end_time       │     │ created_at    │
        │     │              │ status         │     └───────────────┘
        │     │              │ created_at     │
        │     │              └────────┬───────┘
        │     │                       │
        │     │                 ┌─────▼──────────┐
        │     │                 │   PAYMENTS     │
        │     │                 ├────────────────┤
        │     │                 │ id (PK)        │
        │     │                 │ booking_id(FK) │
        │     │                 │ amount         │
        │     │                 │ status         │
        │     │                 │ payment_method │
        │     │                 │ transaction_id │
        │     │                 │ created_at     │
        │     │                 └────────────────┘
        │     │
        │     │
        │     │              ┌──────────────────┐
        │     └─────────────▶│   RESOURCES      │
        │                    ├──────────────────┤
        │                    │ id (PK)          │
        │                    │ name             │
        │                    │ type             │
        │                    │ description      │
        │                    │ price_per_hour   │
        │                    │ status           │
        │                    │ owner_id (FK)    │
        │                    │ created_at       │
        │                    │ updated_at       │
        │                    └──────────────────┘
        │
        └──────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════════════════╗
║                                ТАБЛИЦА СВЯЗЕЙ                                         ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║ Таблица A      │ Связь          │ Таблица B              │ Примечание                 ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║ ROLES          │ 1-ко-М         │ USERS                 │ Одна роль - много юзеров  ║
║ USERS          │ 1-ко-М         │ BOOKINGS              │ Один юзер - много бронич  ║
║ USERS          │ 1-ко-М         │ LOGS                  │ Логирование действий      ║
║ RESOURCES      │ 1-ко-М         │ BOOKINGS              │ Один ресурс - много бронь ║
║ BOOKINGS       │ 1-ко-М         │ PAYMENTS              │ Одна бронь - много платежей║
╚════════════════════════════════════════════════════════════════════════════════════════╝


╔════════════════════════════════════════════════════════════════════════════════════════╗
║                            ДЕТАЛЬНАЯ СТРУКТУРА ТАБЛИЦ                                 ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

┌─ ROLES (Роли в системе)
├─ id (INT, PRIMARY KEY)
├─ name (VARCHAR 50, UNIQUE) → "admin", "manager", "client"
├─ created_at (TIMESTAMP)
└─ Индекс: id (PK), name (UNIQUE)

┌─ USERS (Пользователи)
├─ id (INT, PRIMARY KEY)
├─ name (VARCHAR 255)
├─ email (VARCHAR 255, UNIQUE) → для логина
├─ password_hash (VARCHAR 255) → bcryptjs
├─ role_id (INT, FOREIGN KEY → ROLES.id)
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
├─ is_active (BOOLEAN, DEFAULT true)
└─ Индексы: id (PK), email (UNIQUE), role_id (FK)

┌─ RESOURCES (Ресурсы/номера/техника)
├─ id (INT, PRIMARY KEY)
├─ name (VARCHAR 255) → "Номер 101", "Бульдозер #1"
├─ type (VARCHAR 100) → "room", "vehicle", "tool"
├─ description (TEXT)
├─ price_per_hour (DECIMAL 10,2)
├─ status (VARCHAR 50) → "available", "booked", "maintenance"
├─ owner_id (INT, FOREIGN KEY → USERS.id) → кто управляет ресурсом
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
└─ Индексы: id (PK), owner_id (FK), status (для фильтрации)

┌─ BOOKINGS (Бронирования)
├─ id (INT, PRIMARY KEY)
├─ user_id (INT, FOREIGN KEY → USERS.id)
├─ resource_id (INT, FOREIGN KEY → RESOURCES.id)
├─ start_time (TIMESTAMP)
├─ end_time (TIMESTAMP)
├─ status (VARCHAR 50) → "pending", "confirmed", "completed", "cancelled"
├─ notes (TEXT) → доп. заметки
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
└─ Индексы: id (PK), user_id (FK), resource_id (FK), status (для фильтра)

┌─ PAYMENTS (Платежи)
├─ id (INT, PRIMARY KEY)
├─ booking_id (INT, FOREIGN KEY → BOOKINGS.id)
├─ amount (DECIMAL 12,2)
├─ status (VARCHAR 50) → "pending", "completed", "failed", "refunded"
├─ payment_method (VARCHAR 100) → "card", "stripe", "bank_transfer"
├─ transaction_id (VARCHAR 255) → ID от платежной системы
├─ metadata (JSONB) → доп. данные от платежных систем
├─ created_at (TIMESTAMP)
└─ Индексы: id (PK), booking_id (FK), transaction_id (UNIQUE)

┌─ LOGS (Логирование действий)
├─ id (INT, PRIMARY KEY, AUTO INCREMENT)
├─ user_id (INT, FOREIGN KEY → USERS.id)
├─ action (VARCHAR 255) → "user_created", "booking_made", "payment_received"
├─ details (JSONB) → {"resource_id": 5, "old_status": "available", "new_status": "booked"}
├─ ip_address (VARCHAR 45)
├─ user_agent (VARCHAR 500)
├─ created_at (TIMESTAMP)
└─ Индексы: id (PK), user_id (FK), created_at (для аналитики)

═════════════════════════════════════════════════════════════════════════════════════════

⚙️ ВСПОМОГАТЕЛЬНЫЕ ТАБЛИЦЫ (опционально)

┌─ REFRESH_TOKENS (Для обновления JWT)
├─ id (INT, PRIMARY KEY)
├─ user_id (INT, FK → USERS.id)
├─ token (TEXT)
├─ expires_at (TIMESTAMP)
└─ created_at (TIMESTAMP)

┌─ NOTIFICATIONS (Email/SMS уведомления)
├─ id (INT, PRIMARY KEY)
├─ user_id (INT, FK → USERS.id)
├─ type (VARCHAR 50) → "booking_confirmed", "payment_received", "reminder"
├─ status (VARCHAR 50) → "sent", "failed", "pending"
├─ message (TEXT)
└─ created_at (TIMESTAMP)

┌─ AUDIT_LOG (Жёсткий аудит всех изменений)
├─ id (INT, PRIMARY KEY)
├─ table_name (VARCHAR 100)
├─ record_id (INT)
├─ action (VARCHAR 50) → "INSERT", "UPDATE", "DELETE"
├─ old_data (JSONB)
├─ new_data (JSONB)
├─ user_id (INT, FK → USERS.id)
└─ created_at (TIMESTAMP)

═════════════════════════════════════════════════════════════════════════════════════════

📊 ПРИМЕРЫ SQL ТРИГГЕРОВ И ФУНКЦИЙ

1️⃣ Триггер для логирования создания бронирования:
   CREATE TRIGGER log_booking_created
   AFTER INSERT ON bookings
   FOR EACH ROW
   EXECUTE FUNCTION log_booking_action();

2️⃣ Функция для массового обновления статуса ресурсов:
   CREATE FUNCTION update_overdue_bookings()
   RETURNS void AS $$
   BEGIN
     UPDATE bookings SET status = 'completed' 
     WHERE end_time < NOW() AND status != 'completed';
   END;
   $$ LANGUAGE plpgsql;

3️⃣ Индекс для быстрого поиска доступных ресурсов:
   CREATE INDEX idx_resources_status ON resources(status) 
   WHERE status = 'available';

4️⃣ Вью для статистики по бронированиям:
   CREATE VIEW booking_statistics AS
   SELECT 
     DATE(b.created_at) as date,
     COUNT(*) as total_bookings,
     SUM(p.amount) as total_revenue
   FROM bookings b
   LEFT JOIN payments p ON b.id = p.booking_id
   GROUP BY DATE(b.created_at);

═════════════════════════════════════════════════════════════════════════════════════════
```
