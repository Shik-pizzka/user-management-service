# User Management Service

REST API сервис для управления пользователями. Реализует регистрацию, авторизацию через JWT и ролевой доступ (admin / user).

## Стек

- **Runtime**: Node.js
- **Framework**: Express
- **База данных**: MongoDB
- **ODM**: Mongoose
- **Авторизация**: JWT (jsonwebtoken)
- **Хэширование паролей**: bcryptjs
- **Валидация**: express-validator

---

## Быстрый старт

### 1. Клонируй репозиторий

```bash
git clone https://github.com/<твой-никнейм>/user-management-service.git
cd user-management-service
```

### 2. Установи зависимости

```bash
npm install
```

### 3. Настрой переменные окружения

```bash
cp .env.example .env
```

Открой `.env` и заполни:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/user-management
JWT_SECRET=придумай_длинную_секретную_строку
JWT_EXPIRES_IN=7d
```

### 4. Создай первого администратора

```bash
npm run seed:admin
```

Создаст пользователя `admin@example.com` / `admin123456`.
После первого входа смени пароль.

### 5. Запусти сервер

```bash
npm run dev     # с автоперезагрузкой (для разработки)
npm start       # обычный запуск
```

---

## API Endpoints

### Публичные (без токена)

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/users/register` | Регистрация нового пользователя |
| POST | `/api/users/login` | Вход, возвращает JWT токен |

### Приватные (нужен токен)

Добавляй заголовок: `Authorization: Bearer <token>`

| Метод | URL | Доступ | Описание |
|-------|-----|--------|----------|
| GET | `/api/users` | admin | Список всех пользователей |
| GET | `/api/users/:id` | admin или сам пользователь | Получить пользователя по ID |
| PATCH | `/api/users/:id/block` | admin или сам пользователь | Заблокировать пользователя |

---

## Примеры запросов

### Регистрация

```http
POST /api/users/register
Content-Type: application/json

{
  "fullName": "Иван Иванов",
  "dateOfBirth": "1995-06-15",
  "email": "ivan@example.com",
  "password": "mypassword123"
}
```

Ответ `201`:
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "data": {
    "_id": "665f1a...",
    "fullName": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "user",
    "isActive": true
  }
}
```

### Вход

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

### Получить список пользователей (только admin)

```http
GET /api/users
Authorization: Bearer eyJhbGci...
```

### Заблокировать пользователя

```http
PATCH /api/users/665f1a.../block
Authorization: Bearer eyJhbGci...
```

---

## Структура проекта

```
src/
  config/
    db.js                 # подключение к MongoDB
  middlewares/
    auth.middleware.js    # проверка JWT токена
    role.middleware.js    # проверка роли
  modules/
    users/
      user.model.js       # Mongoose схема пользователя
      user.repository.js  # запросы к базе данных
      user.service.js     # бизнес-логика
      user.controller.js  # обработка HTTP запросов
      user.routes.js      # маршруты
      user.validator.js   # правила валидации
  app.js                  # настройка Express
scripts/
  seed-admin.js           # создание первого администратора
server.js                 # точка входа
```

---

## HTTP коды ответов

| Код | Значение |
|-----|----------|
| 200 | Успех |
| 201 | Ресурс создан |
| 400 | Некорректный запрос |
| 401 | Не авторизован (нет токена или токен невалидный) |
| 403 | Нет доступа (роль не позволяет) |
| 404 | Ресурс не найден |
| 409 | Конфликт (например, email уже занят) |
| 422 | Ошибка валидации входных данных |
| 500 | Внутренняя ошибка сервера |
