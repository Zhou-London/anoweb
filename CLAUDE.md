# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal website `zhouzhouzhang.co.uk`. Go/Gin backend (`cmd/anoweb`) + React 19/Vite SSR frontend (`static/anoweb-front`). Production runs behind Caddy, which proxies `/api*` to `localhost:8080` and serves the prerendered SPA from `/var/www/anoweb`. See `docs/Caddyfile` and `docs/myserver.service`.

## Commands

### Backend (Go)
- Build: `go build -o ../../apps/anoweb ./cmd/anoweb/` (path is production-relative; for local sanity-check, `go build ./cmd/anoweb/` works).
- Run all tests: `go test ./...`
- Run one package: `go test ./internal/vbook/`
- Run a single test: `go test ./internal/vbook/ -run TestAggregateProgress_EmptyInput`
- Requires a `.env` file (see `env-example`). Loaded via `godotenv.Load()` at startup; missing `PORT`/`DB*`/`DOMAIN`/`ADMIN_PASS`/`IMG_PATH`/`IMG_URL_PREFIX` causes `log.Fatal`.
- Regenerate Swagger after API changes: `swag init -g cmd/anoweb/main.go -o ./docs` (README's `src/main.go` path is stale).

### Frontend (`static/anoweb-front`)
- Dev: `npm run dev` (Vite dev server; use this for local iteration — see "Local vs production paths" below).
- Full production build: `npm run build` — runs `tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-server && node prerender.mjs`. This writes to `/var/www/anoweb`, so it only makes sense on the deploy host.
- Client-only build (no SSR prerender, still writes to `/var/www/anoweb`): `npm run build:client`.
- Lint: `npm run lint`

### Deployment
- Backend binary runs under systemd unit `myserver` (`docs/myserver.service`). After a Go rebuild: `sudo systemctl restart myserver`.
- Caddy config: `docs/Caddyfile`. Images are served from `/var/www/images/anoweb` under `/image/*`.

## Architecture

### Go module name is legacy
The module path is `anonchihaya.co.uk` (old domain). **Do not rename it** — it's used by every internal import (`anonchihaya.co.uk/internal/...`).

### Backend feature module pattern
Each domain feature under `internal/<feature>/` follows the same shape: `model.go` (GORM struct + DTOs), `repository.go` (`XxxRepository` interface + `xxxRepository` struct backed by `store.DB`), `handler.go` (Gin handler funcs that take the repo interface as an argument). Routes are wired separately in `internal/routes/<feature>_routes.go` as `registerXxxRoutes(...)`.

Adding a feature touches **five** places — miss any and it won't boot:
1. New `internal/<feature>/` package with model/repo/handler.
2. New `internal/routes/<feature>_routes.go` with `registerXxxRoutes`.
3. Append the model(s) to the `store.DB.AutoMigrate(...)` call in `cmd/anoweb/main.go`.
4. Construct the repo in `main.go` and thread it through `routes.InitRoutes(...)`.
5. Add the repo parameter + `registerXxxRoutes` call in `internal/routes/router.go`.

`internal/blog/` + `Pages/Blogs/` is the canonical end-to-end reference — mirror it for new CRUD features. `internal/vbook/` is a more recent example that also includes per-fan progress tracking and a boot-time `SeedDefaults` call.

Note: `internal/learning/` has a model and repository but is **not wired into routes** — it is only in `AutoMigrate`. It is an incomplete feature.

### Database
`internal/store/database.go` only wires **MySQL** via GORM, despite `gorm.io/driver/sqlite` appearing in `go.mod`. Production and local both hit MySQL. `AGENTS.md` mentions SQLite for testing, but no test bootstrap currently uses it — existing tests (see `internal/vbook/handler_test.go`) exercise pure functions and avoid the DB entirely. Follow that pattern: isolate testable logic from GORM calls.

In dev mode (`APP_ENV != "production"`), `config.Load()` swaps `DBNAME` for `DBNAME_TEST` from the env.

### Auth model
One user type: `auth.Fan` (see `internal/auth/fan_model.go`). Two sign-up paths: email/password with SMTP-based email verification, or Google OAuth (`internal/auth/oauth_handler.go`, configured via `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REDIRECT_URL` env vars). Sessions are cookie-based (`session_token` HTTP cookie), resolved in `internal/auth/middleware.go`:
- `AuthMiddleware(sessionRepo)` — rejects unauthenticated requests.
- `OptionalAuthMiddleware(sessionRepo)` — sets `user` in context if the cookie is valid, otherwise continues.
- `AdminMiddleware()` — requires `fan.IsAdmin == true`; must be chained after one of the above.

The authenticated fan is stored in the Gin context under the key `"user"` as a `*auth.Fan` (historical naming — see the comment in `AuthMiddleware`). Access it as:
```go
user, _ := c.Get("user")
fan, _ := user.(*auth.Fan)
```

Admin status is granted by redeeming mystery codes (see `internal/mysterycode/` and `docs/MYSTERY_CODE_SETUP.md`).

### Two unrelated write-protection systems
Don't confuse them:
- **Session-based `AdminMiddleware`** — the modern path, used by most feature admin routes (vbook, blog, etc.).
- **`middlewares.KeyChecker(key)`** — a legacy pre-session guard that looks for a `key` value in query/form/cookie/JSON body on write methods. Still referenced by a few route registrations (e.g. `static/upload-image`, admin routes), but **effectively disabled**: `main.go` passes `""` as the `key` argument to `InitRoutes` (line 114), so `KeyChecker` always sees an empty key.

### VBooks hybrid architecture
VBooks have a split data model. The **backend** (DB) stores VBook metadata and per-fan/per-chapter/per-section progress. The **frontend** defines chapter content entirely in TypeScript files under `Pages/VBooks/chapters/<book-slug>/`. Each book has an `index.ts` that exports a `ChapterDef[]` array — chapter titles, section IDs, and the React component for each section. Adding a new chapter means adding TS files and re-exporting from the book's `index.ts`; no backend change is needed unless the VBook itself is new (in which case `SeedDefaults` or an admin API call creates the DB record).

### Frontend SSR pipeline
`npm run build` is a four-step pipeline:
1. `tsc -b` — strict type-check (see below).
2. `vite build` — client bundle → `/var/www/anoweb`.
3. `vite build --ssr src/entry-server.tsx --outDir dist-server` — Node-side renderer.
4. `node prerender.mjs` — imports the SSR `render(url)`, walks a hard-coded route list, injects per-route `<title>`/meta/canonical/JSON-LD, writes `index.html` per route into `/var/www/anoweb/<route>/`, then deletes `dist-server`.

Client hydration in `src/main.tsx` checks whether `#root` has prerendered content: if yes → `hydrateRoot`, else → `createRoot`.

**Adding a new public (prerenderable) route requires three edits:**
1. `src/App.tsx` — add the `<Route>`.
2. `src/entry-server.tsx` — add an entry to `routeMeta` (title/description).
3. `prerender.mjs` — add the path to the `routes` array.

Skipping any of the three means the route ships but loses SEO / SSR HTML.

### Local vs production paths in Vite config
`vite.config.ts` has `build.outDir = "/var/www/anoweb"` (absolute to the production machine) and `prerender.mjs` reads/writes that same path. Consequence: **`npm run build` only works on the deploy host**. For local development, use `npm run dev` — it serves from memory and never touches `/var/www`.

### Frontend contexts & conventions
Provider order (both `main.tsx` and `entry-server.tsx`): `ThemeProvider → ErrorProvider → SuccessProvider → FanProvider → EditModeProvider`. `FanContext` exposes the current fan + `isAdmin`. `EditModeContext` is the admin-only edit toggle — **admin UI must be gated on `isAdmin && editMode`**, not `isAdmin` alone. See `src/Components/edit_mode_toggle.tsx` and the `Pages/Blogs` implementation.

### Theming
Tailwind CSS v4 is installed via `@tailwindcss/vite` — there is no `tailwind.config.js`. All theme tokens are CSS custom properties defined on `:root` / `[data-theme="dark"]` in `src/style.css` (gruvbox-style `--gb-bg`, `--gb-fg`, `--gb-accent`, etc.). **Do not hardcode colors**; use `var(--gb-*)` so dark/light mode works.

### TypeScript strict mode caveats
`verbatimModuleSyntax` is on, so type-only imports **must** use `import type { ... }` — mixing values and types in a single import will fail `tsc`. React 19 removed the global `JSX` namespace: use `import type { ReactElement }` instead of `JSX.Element`.

### API client
All frontend HTTP goes through `src/lib/api.ts` (`apiUrl`, `apiFetch`, `apiJson`). Paths are rooted at `/api` (base is configurable via `VITE_API_BASE_URL`). Use `credentials: "include"` so the `session_token` cookie flows with the request. Errors throw `ApiError` — catch and surface via `ErrorContext`.

## House rules (from AGENTS.md)

- Don't bump existing dependency versions. Adding new dependencies is fine.
- Match the existing code and UI style. UI aesthetic targets Google's visual style; keep component copy terse — avoid verbose descriptions or instructional text inside UI components.
