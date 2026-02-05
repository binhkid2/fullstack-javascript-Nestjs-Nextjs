 

**Project Logic & Architecture Brief**

**Goal**
A full‑stack app with Next.js frontend and a backend API that supports:
- Email/password login
- Magic‑link login
- Google OAuth login
- JWT‑based session with refresh tokens
- Role‑based access control (ADMIN, MANAGER, MEMBER)
- Blog posts CRUD with strict permissions
- Public blog listing and blog detail by slug
- Admin-only user management
- Dashboard UI for authenticated users

---

## 1. Authentication & Session Flow

### Backend responsibilities
- **Email/password login**
  - `POST /auth/login` accepts `{email, password}`
  - Validates credentials, returns `{accessToken, refreshToken, user}`
- **Magic-link login**
  - `POST /auth/magic-link` accepts `{email}`
  - Sends an email with a signed token link
  - `GET /auth/magic-link/verify` validates token and returns tokens + user
- **Google OAuth**
  - `GET /auth/google` starts OAuth
  - `GET /auth/google/callback` handles provider callback
  - Creates user if first time, then issues tokens
  - Redirects to frontend `/oauth/google` with tokens + user info

### Tokens
- **Access token** (JWT) contains `{sub, email, role}`
- **Refresh token** stored in DB for rotation and revocation
- Backend issues both tokens for every login flow.

### Frontend responsibilities (Next.js)
- Uses **NextAuth** with a **JWT session strategy**
- Custom **CredentialsProvider** for:
  - Password login
  - Magic-link verification
  - Google OAuth callback
- Stores access/refresh tokens in JWT and session
- Session is available server-side or client-side:
  - `getServerSession` (server)
  - `useSession` (client)
- `accessToken` is passed to protected API calls.

---

## 2. Role‑Based Access Control (RBAC)

**Roles:**
- `MEMBER` – read‑only blog list
- `MANAGER` – can read + create blog posts (draft only)
- `ADMIN` – full CRUD + user management

**Permissions:**
- `GET /blog-posts` → authenticated (any role)
- `POST /blog-posts` → ADMIN + MANAGER
- `PATCH /blog-posts/:id` → ADMIN only
- `DELETE /blog-posts/:id` → ADMIN only
- `POST /users` → ADMIN only
- `PATCH /users/:id/role` → ADMIN only

---

## 3. Blog Post Data Model

**Table: `blog_posts`**

Fields:
- `id` (UUID)
- `title` (string)
- `slug` (string, unique)
- `status` enum: `draft | published | archived`
- `excerpt` (string)
- `content` (text)
- `content_format` enum: `markdown | html`
- `featured_image` (JSON) `{id, url, alt}`
- `categories` (text[])
- `tags` (text[])
- `author_id` (UUID, user.id)
- `created_at`
- `updated_at`
- `published_at`

Rules:
- If `status = published` then `published_at` must be set.
- `published_at` can be set automatically when admin marks as published.

---

## 4. Public Blog Pages (No Auth Required)

**Public endpoints**
- `GET /blog-posts/public`
  - returns only `status = published` and non-empty `slug`
- `GET /blog-posts/public/:slug`
  - returns single published post by slug

**Frontend pages**
- `/` (landing)
  - top welcome card
  - below: grid of published blogs (title + excerpt + featured image)
  - if user is logged in: hide “Sign in” button
- `/blog/[slug]`
  - renders blog content
  - shows featured image
  - displays categories/tags

---

## 5. Dashboard (Authenticated)

**Behavior**
- Requires login
- Shows user email + role
- Blog list table (title, status, updated, author email, actions)
- Status column:
  - MEMBER/MANAGER: plain text
  - ADMIN: select dropdown → update status
  - confirmation dialog on change
  - automatically sets `published_at` on publish
- Admin can edit/delete posts
- Manager can create draft
- Admin can create/edit posts

**Editor Form**
Fields:
- title
- slug
- excerpt
- content
- content format (markdown/html)
- featuredImage url/alt/id
- categories (comma-separated)
- tags (comma-separated)
- status (admin only)

---

## 6. User Management

**Admin-only**
- `POST /users` creates a user with `{name, email, password, role}`
- `PATCH /users/:id/role` changes role
- Admin can edit user name (email is read-only in the UI)

---

## 7. Token Storage / NextAuth Logic (Frontend)

- Tokens stored in NextAuth JWT callback
- Session shape:
  - `session.accessToken`
  - `session.refreshToken`
  - `session.user.role`

---

## 8. Environment / Configuration

Backend expects:
- `DATABASE_URL` (remote Postgres)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `MAGIC_LINK_BASE_URL` (frontend URL)

Frontend expects:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL` (backend API URL)
- `INTERNAL_API_URL` (Docker-to-Docker host, optional)

---

## 9. Expected UI / UX Behaviors

- Sign-in / sign-up / reset are tabbed on `/auth`
- Toasts show for errors/success
- `/auth` redirects to `/dashboard` when already authenticated
- `/` hides “Sign in” button if authenticated

---

## 10. Data Flow Summary (High Level)

- User logs in → backend issues JWT + refresh → NextAuth stores tokens → frontend uses accessToken for authenticated calls
- Public blog list → directly from backend public endpoints
- Admin updates blog → PATCH /blog-posts/:id with new status → published_at auto-set

--- 
