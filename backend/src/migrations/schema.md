# Database Schema (Visual)

```mermaid
erDiagram
  USERS {
    UUID id PK
    VARCHAR email
    VARCHAR name
    ENUM users_role_enum role
    VARCHAR passwordHash
    BOOLEAN isActive
    TIMESTAMPTZ createdAt
    TIMESTAMPTZ updatedAt
  }

  REFRESH_TOKENS {
    UUID id PK
    VARCHAR tokenHash
    TIMESTAMPTZ expiresAt
    TIMESTAMPTZ revokedAt
    TIMESTAMPTZ createdAt
    UUID userId FK
  }

  MAGIC_LINK_TOKENS {
    UUID id PK
    VARCHAR tokenHash
    TIMESTAMPTZ expiresAt
    TIMESTAMPTZ usedAt
    TIMESTAMPTZ createdAt
    UUID userId FK
  }

  PASSWORD_RESET_TOKENS {
    UUID id PK
    VARCHAR tokenHash
    TIMESTAMPTZ expiresAt
    TIMESTAMPTZ usedAt
    TIMESTAMPTZ createdAt
    UUID userId FK
  }

  OAUTH_ACCOUNTS {
    UUID id PK
    VARCHAR provider
    VARCHAR providerId
    VARCHAR email
    TIMESTAMPTZ createdAt
    UUID userId FK
  }

  BLOG_POSTS {
    UUID id PK
    VARCHAR title
    VARCHAR slug
    ENUM post_status status
    VARCHAR excerpt
    TEXT content
    VARCHAR content_format
    UUID author_id FK
    JSONB featured_image
    BOOLEAN is_featured
    INT views
    TEXT_ARRAY categories
    TEXT_ARRAY tags
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }

  USERS ||--o{ REFRESH_TOKENS : has
  USERS ||--o{ MAGIC_LINK_TOKENS : has
  USERS ||--o{ PASSWORD_RESET_TOKENS : has
  USERS ||--o{ OAUTH_ACCOUNTS : has
  USERS ||--o{ BLOG_POSTS : authors
```

## Notes
- `users_role_enum`: ADMIN, MANAGER, MEMBER
- `post_status`: draft, published, archived
- `featured_image` is a JSON object `{ id, url, alt }`
- `categories` and `tags` are text arrays
