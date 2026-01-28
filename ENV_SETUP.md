# 🔧 Инструкция по настройке переменных окружения

## 📋 Быстрый старт

### 1. Создайте файл `.env`

```bash
cp .env.example .env
```

### 2. Отредактируйте значения

```bash
nano .env  # или используйте ваш любимый редактор
```

### 3. Убедитесь что `.env` в `.gitignore`

```bash
cat .gitignore | grep "^.env"
# Должно быть: .env
```

## 🔐 Переменные окружения

### Database Configuration

| Переменная | Значение по умолчанию | Описание |
|-----------|-----------------|-----------|
| `DB_HOST` | `localhost` | Хост базы данных |
| `DB_PORT` | `5432` | Порт PostgreSQL |
| `DB_USER` | `postgres` | Имя пользователя БД |
| `DB_PASSWORD` | `12345678` | Пароль БД |
| `DB_NAME` | `db_bronare` | Имя базы данных |

### Server Configuration

| Переменная | Значение по умолчанию | Описание |
|-----------|-----------------|-----------|
| `NODE_ENV` | `development` | Окружение (development/production) |
| `SERVER_PORT` | `3000` | Порт сервера |

## 📝 Примеры конфигурации

### Development (локальная разработка)

`.env`:
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=12345678
DB_NAME=db_bronare

# Server
NODE_ENV=development
SERVER_PORT=3000
```

### Production (реальный сервер)

`.env` на сервере:
```
# Database (безопасные значения)
DB_HOST=prod-db-server.example.com
DB_PORT=5432
DB_USER=app_user
DB_PASSWORD=ваш_безопасный_пароль_здесь
DB_NAME=db_bronare_prod

# Server
NODE_ENV=production
SERVER_PORT=3000
```

### Testing (тестирование)

`.env`:
```
# Database (тестовая БД)
DB_HOST=localhost
DB_PORT=5432
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=db_bronare_test

# Server
NODE_ENV=test
SERVER_PORT=3001
```

## 🔐 Безопасные пароли

### Генерация сильного пароля

```bash
# Способ 1: OpenSSL (Linux/macOS)
openssl rand -base64 32

# Способ 2: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Способ 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Требования к паролю

✅ Минимум 16 символов  
✅ Буквы (верхний и нижний регистр)  
✅ Цифры  
✅ Специальные символы (!@#$%^&*)  
✅ Без пробелов  
✅ Без кавычек  

### Пример хорошего пароля

```
K9m$2xL@pQ8vN4jB!sR3tY5wE7uI0aF
```

## 🔄 Использование в коде

### Node.js

```javascript
// ✅ ПРАВИЛЬНО - используем переменные окружения
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'default_password',
    database: process.env.DB_NAME || 'db_bronare'
};

// ❌ НЕПРАВИЛЬНО - пароль захардкожен
const badConfig = {
    password: '12345678'  // Опасно!
};
```

### Чтение из `.env`

Метод 1: вручную (самый безопасный)
```javascript
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.warn('⚠️ .env файл не найден');
        return {};
    }
    
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
}

loadEnv();
```

Метод 2: использование пакета `dotenv`
```bash
npm install dotenv
```

```javascript
require('dotenv').config();

const dbPassword = process.env.DB_PASSWORD;
```

## 🐳 Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# .env НЕ копируем (используем переменные окружения)

EXPOSE 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-12345678}
      POSTGRES_DB: ${DB_NAME:-db_bronare}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:-12345678}
      DB_NAME: ${DB_NAME:-db_bronare}
      NODE_ENV: ${NODE_ENV:-development}
      SERVER_PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  postgres_data:
```

## ✅ Проверка конфигурации

```bash
# 1. Проверьте что .env существует
ls -la .env

# 2. Проверьте содержимое (без паролей)
grep -v "PASSWORD" .env

# 3. Проверьте что .env не отслеживается Git
git status | grep .env

# 4. Проверьте что .env в .gitignore
git check-ignore .env

# 5. Тест подключения к БД
node -e "
  require('dotenv').config();
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
"
```

## 🚨 Проблемы и решения

### Проблема: "Cannot find module dotenv"

```bash
npm install dotenv
```

### Проблема: ".env файл не найден"

```bash
# Проверьте что файл существует в корне проекта
ls -la .env

# Создайте из примера
cp .env.example .env
```

### Проблема: "Не могу подключиться к БД"

1. Проверьте значения в `.env`
2. Проверьте что PostgreSQL запущена
3. Проверьте правильность пароля
4. Проверьте что хост доступен

```bash
# Тест подключения
psql -h localhost -U postgres -d db_bronare
```

### Проблема: "Переменные окружения не загружаются"

```javascript
// Убедитесь что dotenv загружается в начале
require('dotenv').config();

// ИЛИ вручную установите переменные
process.env.DB_PASSWORD = 'my_password';
```

## 🔗 Полезные ссылки

- [dotenv npm package](https://www.npmjs.com/package/dotenv)
- [PostgreSQL Environment Variables](https://www.postgresql.org/docs/current/libpq-envars.html)
- [Node.js process.env](https://nodejs.org/api/process.html#process_process_env)
- [Docker environment variables](https://docs.docker.com/compose/environment-variables/)

---

**Версия:** 1.0  
**Дата:** 28 января 2026  
**Статус:** ✅ Актуально
