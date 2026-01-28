# 🔧 Настройка переменных окружения

## Быстрый старт

1. **Скопируйте файл примера:**
   ```bash
   cp .env.example .env
   ```

2. **Отредактируйте .env:**
   ```bash
   nano .env  # или любой другой редактор
   ```

3. **Установите свои значения:**
   ```env
   DB_PASSWORD=ваш_реальный_пароль
   JWT_SECRET=ваш_секретный_ключ
   ```

4. **Убедитесь, что .env в .gitignore:**
   ```bash
   cat .gitignore | grep .env
   # Должно показать: .env
   ```

## Генерация безопасных значений

### JWT Secret
```bash
# Сгенерировать случайный секретный ключ
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Пароль базы данных
```bash
# Сгенерировать случайный пароль (16 символов)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

## ⚠️ Важные правила

1. **НИКОГДА** не коммитьте файл `.env` в Git
2. **ВСЕГДА** используйте `.env.example` как шаблон
3. **ХРАНИТЕ** резервную копию `.env` в безопасном месте
4. **МЕНЯЙТЕ** пароли и секреты при развертывании в продакшн

## Проверка конфигурации

```bash
# Проверить, что .env не отслеживается Git
git status --ignored | grep .env

# Должно показать:
# .env (ignored)
```

## Переменные окружения

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|----------|
| DB_HOST | localhost | Хост базы данных |
| DB_USER | postgres | Пользователь БД |
| DB_PORT | 5432 | Порт БД |
| DB_PASSWORD | 12345678 | Пароль БД (измените!) |
| DB_NAME | db_bronare | Имя базы данных |
| JWT_SECRET | - | Секретный ключ для JWT |
| PORT | 3000 | Порт сервера |
| NODE_ENV | development | Окружение (development/production) |

## Пример .env для разработки

```env
DB_HOST=localhost
DB_USER=postgres
DB_PORT=5432
DB_PASSWORD=dev_password_12345
DB_NAME=db_bronare

JWT_SECRET=generated_secret_key_here_32_bytes_minimum
PORT=3000
NODE_ENV=development
```

## Пример .env для продакшн

```env
DB_HOST=your-db-server.com
DB_USER=bukings_prod
DB_PORT=5432
DB_PASSWORD=super_secure_password_from_vault
DB_NAME=bukings_production

JWT_SECRET=production_secret_key_64_bytes_minimum_generated_randomly
PORT=3000
NODE_ENV=production
```

## Использование в Docker

Если используете Docker Compose, создайте `.env` в корне проекта:

```env
# docker-compose будет автоматически использовать эти переменные
DB_HOST=postgres
DB_USER=postgres
DB_PASSWORD=docker_password
DB_NAME=db_bronare
```

## Дополнительная безопасность

### Используйте менеджеры секретов в продакшн

- **AWS**: AWS Secrets Manager
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault
- **Kubernetes**: Secrets
- **Vault**: HashiCorp Vault

### Пример загрузки из AWS Secrets Manager

```javascript
// Вместо .env в продакшн
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret() {
  const data = await secretsManager.getSecretValue({ SecretId: 'bukings/db' }).promise();
  const secret = JSON.parse(data.SecretString);
  return secret;
}
```

---

**Создано:** 28 января 2026  
**Статус:** ✅ Актуально  
**См. также:** [SECURITY_PASSWORD_CLEANUP.md](./DOC/SECURITY_PASSWORD_CLEANUP.md)
