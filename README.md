
# Farm2Fork Backend

Farm2Fork REST API built using:

- Node.js
- Express.js
- Supabase PostgreSQL
- pg
- JWT
- bcryptjs
- Zod

## Installation

```bash
npm install
```

## Environment

Create a `.env` file and configure:

- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- PORT
- NODE_ENV
- ALLOWED_ORIGINS

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Database Test

```bash
npm run test:db
```

## API Base URL

`/api/v1`

## Authentication

- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`
- GET `/api/v1/auth/me`

## Health

- GET `/api/v1/health`
