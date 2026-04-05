# Task Management API

A production-ready REST API built with **Node.js**, **TypeScript**, **Express**, and **Prisma**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Language | TypeScript 5 |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (Access + Refresh tokens) |
| Password | bcryptjs |
| Validation | express-validator |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env — update secrets for production!
```

### 3. Run database migrations
```bash
npx prisma migrate dev --name init
```

### 4. (Optional) Seed sample data
```bash
npx ts-node prisma/seed.ts
# Demo account: demo@taskflow.io / Password1
```

### 5. Start dev server
```bash
npm run dev
# API available at http://localhost:3000
```

---

## Project Structure

```
src/
├── controllers/
│   ├── auth.controller.ts    # register, login, refresh, logout, me
│   └── tasks.controller.ts   # CRUD + toggle + paginated list
├── middleware/
│   ├── auth.middleware.ts    # JWT Bearer token verification
│   └── validation.middleware.ts  # express-validator rules
├── routes/
│   ├── auth.routes.ts
│   └── tasks.routes.ts
├── utils/
│   ├── jwt.ts               # sign/verify helpers
│   ├── prisma.ts            # singleton Prisma client
│   └── response.ts          # sendSuccess/sendError helpers
├── types/
│   └── index.ts             # shared TS interfaces
└── index.ts                 # Express app + server
prisma/
├── schema.prisma            # DB schema (User, Task, RefreshToken)
└── seed.ts                  # Dev seed script
```

---

## API Reference

All protected routes require: `Authorization: Bearer <accessToken>`

### Auth Endpoints

#### `POST /auth/register`
```json
// Body
{ "name": "Alex", "email": "alex@example.com", "password": "Password1" }

// Response 201
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Alex", "email": "alex@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### `POST /auth/login`
```json
// Body
{ "email": "alex@example.com", "password": "Password1" }

// Response 200 — same shape as register
```

#### `POST /auth/refresh`
```json
// Body
{ "refreshToken": "eyJ..." }

// Response 200
{ "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." } }
```

#### `POST /auth/logout`
```json
// Body
{ "refreshToken": "eyJ..." }
// Revokes the token from DB
```

#### `GET /auth/me` 🔒
Returns the authenticated user's profile.

---

### Task Endpoints (all protected 🔒)

#### `GET /tasks`
Query params:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `status` | `PENDING` \| `IN_PROGRESS` \| `DONE` | Filter by status |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` | Filter by priority |
| `search` | string | Search by title (case-insensitive) |
| `sortBy` | `createdAt` \| `title` \| `priority` \| `dueDate` | Sort field |
| `order` | `asc` \| `desc` | Sort order |

```
GET /tasks?status=PENDING&priority=HIGH&search=api&page=1&limit=5
```

#### `POST /tasks`
```json
{
  "title": "Implement login page",
  "description": "Use Figma designs from v2",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-05-01"
}
```

#### `GET /tasks/:id`
Returns a single task owned by the authenticated user.

#### `PATCH /tasks/:id`
Partial update — send only the fields you want to change.

#### `DELETE /tasks/:id`
Returns `{ "id": 5 }` on success.

#### `PATCH /tasks/:id/toggle`
Cycles status: `PENDING → IN_PROGRESS → DONE → PENDING`

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable message",
  "error": "ERROR_CODE"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Unauthorized / token expired |
| 404 | Resource not found |
| 409 | Conflict (e.g. email taken) |
| 500 | Internal server error |

---

## Security Notes

- Passwords are hashed with **bcrypt** (12 rounds)
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days** and are stored in DB
- **Token rotation**: each `/auth/refresh` issues a new pair and invalidates the old refresh token
- Logout revokes the refresh token from DB
- All task endpoints scope queries to the authenticated `userId` — users cannot access others' tasks

---

## Production Checklist

- [ ] Switch `DATABASE_URL` to PostgreSQL
- [ ] Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Add request logging (`morgan`)
- [ ] Set up HTTPS / reverse proxy (nginx)
- [ ] Configure `CLIENT_URL` for your frontend domain
