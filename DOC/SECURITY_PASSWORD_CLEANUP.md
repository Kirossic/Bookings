# 🔒 Безопасность: Удаление пароля из истории Git

## 📋 Проблема

В коммитах репозитория (от 3f7cb9c и ранее) был обнаружен чувствительный пароль:
```
password: "m080603m"
```

**Статус:** ✅ Пароль уже заменён на `"12345678"` во всех текущих файлах  
**Проблема:** ❌ Старый пароль всё ещё доступен в истории Git

## ⚠️ Риски безопасности

Даже если пароль изменён в текущих файлах, он остаётся в истории Git и может быть извлечён:
```bash
# Любой может просмотреть старые коммиты
git log --all -S "m080603m"
git show <commit-hash>:db_local/db.js
```

**Важно:** Если этот пароль использовался для реальной базы данных, его необходимо изменить в самой БД!

## 🛠️ Решение: Очистка истории Git

### Вариант 1: BFG Repo-Cleaner (рекомендуется)

BFG - быстрый и безопасный инструмент для очистки истории Git.

#### Шаг 1: Установка BFG
```bash
# Скачайте с https://rtyley.github.io/bfg-repo-cleaner/
# Или используйте Homebrew (macOS/Linux)
brew install bfg

# Или скачайте JAR файл
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
```

#### Шаг 2: Создайте файл замены паролей
```bash
# Создайте файл passwords.txt
echo "m080603m===>***REMOVED***" > passwords.txt
```

#### Шаг 3: Клонируйте bare репозиторий
```bash
git clone --mirror https://github.com/Kirossic/Bukings.git bukings-mirror
cd bukings-mirror
```

#### Шаг 4: Запустите BFG
```bash
# Если используете JAR файл
java -jar bfg-1.14.0.jar --replace-text passwords.txt

# Или если установили через brew
bfg --replace-text passwords.txt
```

#### Шаг 5: Очистите и принудительно отправьте изменения
```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Вариант 2: git filter-repo (современный подход)

#### Шаг 1: Установка
```bash
pip install git-filter-repo
```

#### Шаг 2: Создайте файл замены
```bash
# Создайте файл replacements.txt
echo "m080603m==>***REMOVED***" > replacements.txt
```

#### Шаг 3: Запустите фильтрацию
```bash
git filter-repo --replace-text replacements.txt
```

#### Шаг 4: Принудительно отправьте изменения
```bash
git push --force --all
git push --force --tags
```

### Вариант 3: git filter-branch (устаревший, но работает)

```bash
# ВНИМАНИЕ: Это медленно для больших репозиториев

# Замените пароль во всех коммитах
git filter-branch --tree-filter '
  find . -type f -name "*.js" -exec sed -i "s/m080603m/***REMOVED***/g" {} \;
' --all

# Очистите
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Принудительно отправьте
git push --force --all
git push --force --tags
```

## 📢 Важные предупреждения

### ⚠️ Перед очисткой истории:

1. **Сообщите всей команде** - после force push все должны будут переклонировать репозиторий
2. **Создайте резервную копию**:
   ```bash
   git clone --mirror https://github.com/Kirossic/Bukings.git bukings-backup
   ```
3. **Закройте все открытые Pull Requests** - они будут повреждены
4. **Проверьте права доступа** - убедитесь, что у вас есть права на force push

### ✅ После очистки истории:

1. **Измените пароль в базе данных** (если `m080603m` использовался реально)
2. **Сообщите команде о переклонировании**:
   ```bash
   cd /path/to/your/project
   git fetch origin
   git reset --hard origin/main  # или ваша основная ветка
   # Или просто переклонируйте:
   git clone https://github.com/Kirossic/Bukings.git
   ```
3. **Проверьте результат**:
   ```bash
   git log --all -S "m080603m"  # Должно быть пусто
   ```

## 🔍 Проверка текущего состояния

### Текущие файлы (✅ Чисто)
```bash
grep -r "m080603m" . --exclude-dir=node_modules
# Результат: пароль не найден в текущих файлах
```

### История Git (❌ Требует очистки)
```bash
git log --all -S "m080603m"
# Если возвращает результаты - нужна очистка истории
```

## 📊 Текущий статус

| Компонент | Статус | Действие |
|-----------|--------|----------|
| Текущие файлы | ✅ Чисто | Пароль заменён на "12345678" |
| История Git | ❌ Требует очистки | Используйте BFG или git-filter-repo |
| База данных | ⚠️ Проверить | Измените пароль если он использовался |

## 🔗 Полезные ссылки

- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://github.com/newren/git-filter-repo)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Atlassian: Remove sensitive data](https://support.atlassian.com/bitbucket-cloud/docs/remove-sensitive-data-from-a-repository-and-its-history/)

## 📝 Рекомендации на будущее

1. **Никогда не коммитьте пароли** - используйте переменные окружения:
   ```javascript
   const con = new Client({
       password: process.env.DB_PASSWORD || "default_for_dev",
   });
   ```

2. **Используйте .env файлы**:
   ```bash
   # .env (добавьте в .gitignore!)
   DB_PASSWORD=m080603m
   ```

3. **Добавьте .gitignore правила**:
   ```
   .env
   .env.local
   *.secret
   secrets/
   ```

4. **Используйте git-secrets** для автоматической проверки:
   ```bash
   git clone https://github.com/awslabs/git-secrets
   cd git-secrets && make install
   git secrets --install
   git secrets --register-aws
   ```

---

**Последнее обновление:** 28 января 2026  
**Приоритет:** 🔴 КРИТИЧЕСКИЙ  
**Статус:** ⚠️ Требуется действие владельца репозитория
