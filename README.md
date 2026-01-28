# Bukings

Система бронирования ресурсов с аутентификацией JWT.

## 🚀 Быстрый старт

### Установка

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/Kirossic/Bukings.git
   cd Bukings
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения:**
   ```bash
   cp .env.example .env
   # Отредактируйте .env и установите свои значения
   ```

4. **Запустите сервер:**
   ```bash
   npm start
   ```

## 🔐 Безопасность

⚠️ **ВАЖНО**: Перед началом работы:

1. **Никогда не коммитьте пароли** в Git
2. **Используйте .env файлы** для хранения секретов
3. **Читайте** [ENV_SETUP.md](ENV_SETUP.md) для настройки окружения
4. **См.** [DOC/SECURITY_PASSWORD_CLEANUP.md](DOC/SECURITY_PASSWORD_CLEANUP.md) для очистки истории Git

## 📚 Документация

Полная документация в папке [DOC/](DOC/):

- [DOCUMENTATION_INDEX.md](DOC/DOCUMENTATION_INDEX.md) - главный индекс документации
- [CRITICAL_TASKS.md](DOC/CRITICAL_TASKS.md) - критические задачи
- [PROJECT_STRUCTURE.md](DOC/PROJECT_STRUCTURE.md) - структура проекта
- [JWT_QUICKSTART.md](DOC/JWT_QUICKSTART.md) - работа с JWT
- [SECURITY_PASSWORD_CLEANUP.md](DOC/SECURITY_PASSWORD_CLEANUP.md) - безопасность

## 📋 Требования

- Node.js >= 14
- PostgreSQL >= 12
- npm или yarn

## 🛠️ Разработка

```bash
# Запустить в режиме разработки
npm start

# Запустить тесты
npm test

# Проверить код
npm run lint
```

## 📞 Поддержка

Если у вас есть вопросы, см. [DOC/DOCUMENTATION_INDEX.md](DOC/DOCUMENTATION_INDEX.md)

