# 🚀 ШАБЛОНЫ И ПРИМЕРЫ КОДА

Готовые шаблоны для быстрого добавления новых функций в проект.

---

## 📋 ШАБЛОН SQL МИГРАЦИИ

### V001__Create_initial_schema.sql

```sql
-- ==========================================
-- МИГРАЦИЯ V001: Создание исходной схемы БД
-- ==========================================

-- 1. Таблица ролей
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка стандартных ролей
INSERT INTO roles (name, description) VALUES 
('admin', 'Администратор системы'),
('manager', 'Менеджер ресурсов'),
('client', 'Обычный пользователь')
ON CONFLICT (name) DO NOTHING;

-- 2. Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 3 REFERENCES roles(id),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 3. Таблица ресурсов
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- room, vehicle, tool
    description TEXT,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, booked, maintenance
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    capacity INTEGER,
    location VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Таблица бронирований
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    total_cost DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_time > start_time)
);

-- 5. Таблица платежей
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_method VARCHAR(100) NOT NULL, -- card, stripe, paypal, bank_transfer
    transaction_id VARCHAR(255) UNIQUE,
    metadata JSONB,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Таблица логирования
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- user_created, booking_made, payment_received
    table_name VARCHAR(100),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности будут добавлены в V002
```

### V002__Add_indexes.sql

```sql
-- ==========================================
-- МИГРАЦИЯ V002: Добавление индексов
-- ==========================================

-- Индексы на users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Индексы на resources
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status) 
WHERE status IN ('available', 'booked');
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_owner_id ON resources(owner_id);

-- Индексы на bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_created ON bookings(user_id, created_at DESC);

-- Индексы на payments
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Индексы на logs
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_table_record ON logs(table_name, record_id);

-- Частичный индекс для доступных ресурсов
CREATE INDEX IF NOT EXISTS idx_resources_available 
ON resources(price_per_hour) WHERE status = 'available';
```

### V003__Add_triggers.sql

```sql
-- ==========================================
-- МИГРАЦИЯ V003: Добавление триггеров
-- ==========================================

-- Функция для логирования действий
CREATE OR REPLACE FUNCTION log_action() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logs (user_id, action, table_name, record_id, new_data, created_at)
    VALUES (
        COALESCE((SELECT id FROM users WHERE email = current_user), NULL),
        TG_ARGV[0],
        TG_TABLE_NAME,
        NEW.id,
        row_to_json(NEW),
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для логирования новых пользователей
CREATE TRIGGER log_user_created AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION log_action('user_created');

-- Триггер для логирования новых бронирований
CREATE TRIGGER log_booking_created AFTER INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION log_action('booking_created');

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resources_timestamp BEFORE UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_timestamp BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_timestamp BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 🔧 ШАБЛОН НОВОГО ENDPOINT

### Добавление CRUD операции

```javascript
// routes/example.js

const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { verifyToken } = require('../backend/Verify_Token');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/example - получить все записи (защищено)
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'created_at' } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      'SELECT * FROM example_table ORDER BY $1 DESC LIMIT $2 OFFSET $3',
      [sort, limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM example_table');
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/example/:id - получить одну запись
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM example_table WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError('Record not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/example - создать новую запись (только админ)
router.post('/', verifyToken, async (req, res, next) => {
  try {
    // Проверка что это админ
    if (req.user.role_id !== 1) {
      throw new ApiError('Only admins can create', 403);
    }

    const { field1, field2, field3 } = req.body;

    // Валидация
    if (!field1 || !field2) {
      throw new ApiError('Missing required fields', 400);
    }

    const result = await db.query(
      'INSERT INTO example_table (field1, field2, field3, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [field1, field2, field3, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/example/:id - обновить запись
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { field1, field2, field3 } = req.body;

    // Проверка что это админ или автор
    const record = await db.query('SELECT created_by FROM example_table WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      throw new ApiError('Record not found', 404);
    }

    if (req.user.role_id !== 1 && req.user.id !== record.rows[0].created_by) {
      throw new ApiError('Permission denied', 403);
    }

    const result = await db.query(
      'UPDATE example_table SET field1 = $1, field2 = $2, field3 = $3 WHERE id = $4 RETURNING *',
      [field1, field2, field3, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/example/:id - удалить запись (только админ)
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role_id !== 1) {
      throw new ApiError('Only admins can delete', 403);
    }

    const result = await db.query(
      'DELETE FROM example_table WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError('Record not found', 404);
    }

    res.json({ message: 'Record deleted', record: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

---

## 🧪 ШАБЛОН UNIT ТЕСТА

```javascript
// tests/example.test.js

const request = require('supertest');
const app = require('../server');

describe('Example API', () => {
  let authToken;
  let exampleId;

  // Подготовка перед тестами
  beforeAll(async () => {
    // Получить токен
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });
    
    authToken = loginRes.body.token;
  });

  // GET тест
  describe('GET /api/example', () => {
    it('should return list of records', async () => {
      const res = await request(app)
        .get('/api/example')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('total');
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/example?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.limit).toBe(5);
    });
  });

  // POST тест
  describe('POST /api/example', () => {
    it('should create a new record', async () => {
      const res = await request(app)
        .post('/api/example')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          field1: 'test value 1',
          field2: 'test value 2',
          field3: 'test value 3'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      exampleId = res.body.id; // Сохраняем ID для других тестов
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/example')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          field1: 'test value 1'
          // field2 отсутствует
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should require admin role', async () => {
      // Получить токен обычного пользователя
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/example')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({
          field1: 'test',
          field2: 'test'
        });

      expect(res.status).toBe(403);
    });
  });

  // GET by ID тест
  describe('GET /api/example/:id', () => {
    it('should return a single record', async () => {
      const res = await request(app)
        .get(`/api/example/${exampleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(exampleId);
    });

    it('should return 404 for non-existent ID', async () => {
      const res = await request(app)
        .get('/api/example/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  // PUT тест
  describe('PUT /api/example/:id', () => {
    it('should update a record', async () => {
      const res = await request(app)
        .put(`/api/example/${exampleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          field1: 'updated value 1',
          field2: 'updated value 2'
        });

      expect(res.status).toBe(200);
      expect(res.body.field1).toBe('updated value 1');
    });
  });

  // DELETE тест
  describe('DELETE /api/example/:id', () => {
    it('should delete a record', async () => {
      const res = await request(app)
        .delete(`/api/example/${exampleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Record deleted');
    });

    it('should return 404 when deleting non-existent record', async () => {
      const res = await request(app)
        .delete('/api/example/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  // Требует аутентификацию
  describe('Authentication', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/example');

      expect(res.status).toBe(401);
    });

    it('should return 403 with invalid token', async () => {
      const res = await request(app)
        .get('/api/example')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(403);
    });
  });
});
```

---

## 📄 ШАБЛОН .ENV ФАЙЛА

```bash
# .env.example

# ==================== SERVER ====================
NODE_ENV=development
PORT=3000
HOST=localhost

# ==================== DATABASE ====================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_bukings
DB_USER=bukings_user
DB_PASSWORD=secure_password_change_me

# ==================== JWT ====================
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=24h

# ==================== STRIPE ====================
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ==================== EMAIL / SMTP ====================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@bukings.com

# ==================== REDIS ====================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ==================== LOGGING ====================
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# ==================== CORS ====================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ==================== EXTERNAL SERVICES ====================
GOOGLE_OAUTH_ID=xxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_SECRET=xxxxx

# ==================== DEPLOYMENT ====================
VPS_HOST=your-server-ip
VPS_USER=ubuntu
VPS_KEY_PATH=/path/to/private/key
```

---

## 🔗 ШАБЛОН REACT КОМПОНЕНТА (АДМИНКА)

```javascript
// admin/src/pages/Users.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../components/Table';
import Form from '../components/Form';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    role_id: '',
    search: ''
  });

  const API_BASE = 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`${API_BASE}/users?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить пользователя?')) {
      try {
        await axios.delete(`${API_BASE}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
        alert('Пользователь удален');
      } catch (error) {
        alert('Ошибка при удалении пользователя');
      }
    }
  };

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Имя', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Роль', key: 'role_id' },
    { label: 'Дата создания', key: 'created_at', type: 'date' }
  ];

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Пользователи</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : 'Добавить пользователя'}
        </button>
      </div>

      {showForm && (
        <Form
          onSubmit={async (data) => {
            try {
              await axios.post(`${API_BASE}/users`, data, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setShowForm(false);
              fetchUsers();
              alert('Пользователь добавлен');
            } catch (error) {
              alert('Ошибка при добавлении пользователя');
            }
          }}
          fields={[
            { name: 'name', label: 'Имя', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Пароль', type: 'password', required: true },
            { name: 'role_id', label: 'Роль', type: 'select', options: [
              { value: 1, label: 'Администратор' },
              { value: 2, label: 'Менеджер' },
              { value: 3, label: 'Пользователь' }
            ]}
          ]}
        />
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.role_id}
          onChange={(e) => setFilters({ ...filters, role_id: e.target.value })}
        >
          <option value="">Все роли</option>
          <option value="1">Администратор</option>
          <option value="2">Менеджер</option>
          <option value="3">Пользователь</option>
        </select>
      </div>

      {loading ? (
        <div className="loader">Загрузка...</div>
      ) : (
        <Table
          columns={columns}
          data={users}
          actions={[
            { label: 'Удалить', onClick: (id) => handleDelete(id), style: 'danger' }
          ]}
        />
      )}
    </div>
  );
}

export default Users;
```

---

## 🐳 ШАБЛОН DOCKERFILE

```dockerfile
# Dockerfile

FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Установка зависимостей (только production)
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Expose порт
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Запуск приложения
CMD ["node", "server.js"]
```

---

## 🔧 ШАБЛОН GITHUB ACTIONS WORKFLOW

```yaml
# .github/workflows/test.yml

name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📋 БЫСТРЫЙ СПРАВОЧНИК SQL ФУНКЦИЙ

```sql
-- Получить доход за месяц
SELECT 
  DATE_TRUNC('month', p.created_at) as month,
  SUM(p.amount) as revenue
FROM payments p
WHERE p.status = 'completed'
GROUP BY DATE_TRUNC('month', p.created_at)
ORDER BY month DESC;

-- Получить популярные ресурсы
SELECT 
  r.id, r.name, 
  COUNT(b.id) as booking_count,
  AVG(EXTRACT(EPOCH FROM (b.end_time - b.start_time))/3600) as avg_hours
FROM resources r
LEFT JOIN bookings b ON r.id = b.resource_id
GROUP BY r.id, r.name
ORDER BY booking_count DESC
LIMIT 10;

-- Получить активных пользователей (за последние 30 дней)
SELECT 
  u.id, u.name, u.email,
  COUNT(b.id) as bookings_count
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id 
  AND b.created_at > NOW() - INTERVAL '30 days'
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email
HAVING COUNT(b.id) > 0
ORDER BY bookings_count DESC;
```

---

**Версия:** 1.0  
**Последнее обновление:** 2 января 2026
