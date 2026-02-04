## Access Tokens (How to Get `accessToken`)

You get an `accessToken` by authenticating against the backend. The backend returns
`accessToken` and `refreshToken` when you log in or verify a magic link.

### Option 1: Login with email + password

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"YourPass123!"}'
```

Response (example):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "uuid",
    "email": "you@example.com",
    "name": "Your Name",
    "role": "MEMBER"
  }
}
```

### Option 2: Magic link

1. Request a link:
```bash
curl -X POST http://localhost:3000/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```
2. Use the link from email (or call verify directly):
```bash
curl "http://localhost:3000/auth/magic-link/verify?email=you@example.com&token=THE_TOKEN"
```

### Using the `accessToken`

Use it as a Bearer token on protected endpoints:

```bash
curl http://localhost:3000/blog-posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Frontend (NextAuth) flow

If you sign in from the Next.js frontend, the app handles tokens for you:

1. The frontend calls the backend `/auth/login` or `/auth/magic-link/verify`.
2. The response contains `accessToken` and `refreshToken`.
3. NextAuth stores these tokens in the session (JWT strategy).

Where this happens:
- `frontend/auth.ts` takes the backend response and attaches tokens to the JWT.
- `frontend/types/next-auth.d.ts` extends the session type to include `accessToken`.

## Admin Seed User (auto-created at startup)

On backend startup we seed an ADMIN user (if it doesn’t already exist).

Seeded account:
```json
{
  "name": "Admin",
  "email": "admin@gmail.com",
  "password": "Whatever123$",
  "role": "ADMIN"
}
```

This is created in `backend/src/main.ts` via `UsersService.ensureAdminSeed(...)`.
