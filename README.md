# user-management-service

REST API для управления пользователями с авторизацией через JWT и ролевым доступом.

## Стек

- Node.js + Express
- MongoDB + Mongoose
- JWT, bcryptjs, express-validator

## Быстрый старт

```bash
git clone https://github.com/Shik-pizzka/user-management-service.git
cd user-management-service
npm install
cp .env.example .env
# заполни .env своими значениями
npm run seed:admin
npm run dev
```

## Переменные окружения

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/user-management
JWT_SECRET=<длинная случайная строка> через bcryptjs
JWT_EXPIRES_IN=7d
```

Сгенерировать секрет:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Эндпоинты

### Публичные

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/users/register` | Регистрация |
| POST | `/api/users/login` | Вход, возвращает JWT |

### Приватные (нужен заголовок `Authorization: Bearer <token>`)

| Метод | URL | Доступ | Описание |
|-------|-----|--------|----------|
| GET | `/api/users/me` | любой авторизованный | Свой профиль |
| GET | `/api/users` | admin | Список всех пользователей |
| GET | `/api/users/:id` | admin или сам пользователь | Профиль по ID |
| PATCH | `/api/users/:id/block` | admin или сам пользователь | Блокировка |

## Пример запроса

```http
POST /api/users/register
Content-Type: application/json

{
  "fullName": "Федотов Никита",
  "dateOfBirth": "2001-07-12",
  "email": "nikita@example.com",
  "password": "password123"
}
```

## Тесты

```bash
npm test
```

## Коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успех |
| 201 | Создано |
| 400 | Некорректный запрос |
| 401 | Нет токена или токен невалидный |
| 403 | Нет доступа |
| 404 | Не найдено |
| 409 | Конфликт (email уже занят) |
| 422 | Ошибка валидации |
| 500 | Внутренняя ошибка |
