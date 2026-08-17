# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Go/Gin backend of the personal website `zhouzhouzhang.co.uk` (a personal site + community forum). The Next.js 16 SSR frontend is a **separate project** at `/home/Zhou/projects/anoweb-front` (own git repo, own CLAUDE.md/AGENTS.md). Production is fully containerised (docker compose: `caddy` + `frontend` + `anoweb` + `mysql`): Caddy proxies `/api*` to the backend container (`anoweb:8080` over the compose network), serves uploaded images from a bind mount, and proxies everything else to the Next.js container (`anoweb-front:3000`).

## Server layout (this machine is the deploy host)

- `/home/Zhou/projects/anoweb` — this repo. Backend source; `Dockerfile` lives here, compiling happens inside the Docker image build.
- `/home/Zhou/projects/anoweb-front` — frontend source (Next.js); compiled inside its own Docker image build.
- `/home/Zhou/apps/anoweb` — runtime directory (never edit code here):
  - `docker-compose.yml` — runs all three containers: backend (build context points back at this repo), MySQL, and Caddy
  - `.env` — production runtime config, bind-mounted read-only into the container at `/app/.env`; its `IMG_PATH=/data/images` is the container-side path. Also read by docker-compose for interpolation: the MySQL container's credentials come from the same `DBUSER`/`DBPASS`/`DBNAME` (plus `MYSQL_ROOT_PASSWORD`, compose-only).
  - `www/` — legacy prerendered SPA (no longer served; kept as backup)
  - `images/` — uploaded images; served by Caddy at `/image/*`, bind-mounted into the container at `/data/images`
  - `mysql-data/` — MySQL datadir (bind mount, owned by uid 999)
  - `mysql-init/` — init SQL (grants for the test DB); only executed when `mysql-data/` is empty. The 2026-08 migration dumps were deleted after import; pre-migration backups live in `~/backups/`.
  - `Caddyfile` — web server config, bind-mounted into the Caddy container (tracked copy: `docs/Caddyfile`)
  - `caddy-data/`, `caddy-config/` — Caddy state; `caddy-data/` holds the TLS certificates (migrated from the old host Caddy, so nothing was re-issued)

## Commands

### Build & test
- Compile sanity-check: `go build ./cmd/anoweb/` (output `./anoweb` is gitignored; production compiles inside Docker instead).
- Run all tests: `go test ./...`
- Run one package: `go test ./internal/<feature>/` (no test files exist at the moment)
- Running the binary requires a `.env` file (see `env-example`), loaded via `godotenv.Load()` at startup; a missing `.env` or missing `PORT`/`DB*`/`DOMAIN`/`IMG_PATH`/`IMG_URL_PREFIX` causes `log.Fatal`.
- Regenerate Swagger after API changes: `swag init -g cmd/anoweb/main.go -o ./docs`. The generated `docs/docs.go` is imported by `internal/routes/swagger_routes.go`, so `docs/` must stay in the Docker build context.

### Deployment (Docker)
There is **no systemd unit anymore**; the backend runs as a Docker container.

```sh
cd /home/Zhou/apps/anoweb
docker compose up -d --build   # recompile (inside Docker) and restart
docker compose logs -f         # logs (container name: anoweb)
```

Key decisions baked into `Dockerfile` / `docker-compose.yml` — don't undo them casually:
- **All three services share the default compose bridge network** and talk by service name: Caddy → `anoweb:8080`, app → `mysql:3306` (`DBHOST=mysql` in the production `.env`). The app binds `0.0.0.0` inside its container via `LISTEN_HOST=0.0.0.0` (empty/unset falls back to `localhost` — dev behavior).
- **Host port mappings**: Caddy publishes 80/443 (public); `anoweb` and `mysql` publish `127.0.0.1:8080` / `127.0.0.1:3306` for local debugging/admin only. There is **no MySQL or Caddy installed on the host anymore** (packages purged); use `docker exec anoweb-mysql mysql -uZhou -p...` for manual queries.
- The app service has `depends_on: condition: service_healthy` on MySQL.
- The app container runs as `user: "1002:1003"` (Zhou) so uploaded images stay owned by Zhou on the host.
- `.env` is excluded from the image via `.dockerignore` and bind-mounted at runtime instead.

Frontend deployment: `cd /home/Zhou/apps/anoweb && docker compose up -d --build frontend` (builds the Next.js image from `/home/Zhou/projects/anoweb-front` and restarts the `anoweb-front` container).

After changing the Caddy config: `cat docs/Caddyfile > /home/Zhou/apps/anoweb/Caddyfile && docker exec caddy caddy reload --config /etc/caddy/Caddyfile`. Caddy now runs as a **shared stack** in `/home/Zhou/apps/caddy` (container name `caddy`) whose main Caddyfile `import`s `/home/Zhou/apps/anoweb/Caddyfile`; both files are bind-mounted **as single files**, so always overwrite in place (`cat >`, not an editor's atomic rename or anything that replaces the inode) and confirm with `docker exec caddy md5sum /home/Zhou/apps/anoweb/Caddyfile` — if the hashes differ the mount is pinned to a stale inode and the container needs `docker restart caddy`.

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

`internal/blog/` is the canonical reference — mirror it for new CRUD features (its frontend counterpart is `src/app/blog/` in the frontend repo).

Note: `internal/learning/` has a model and repository but is **not wired into routes** — it is only in `AutoMigrate`. It is an incomplete feature.

### List endpoints: two response shapes
`GET /api/post`, `/api/post/project/:id`, `/api/project` and `/api/blog` answer in **one of two shapes**, chosen by whether the request carries `?page=`:

- **No `?page=`** → a bare JSON array of every matching row, exactly as before. The sitemap, the home page, `/forum/new`, the project/thread pages' project lookups and every admin manager depend on this — don't "tidy" it into an envelope without fixing all of them.
- **With `?page=`** → a `util.PagedResponse` envelope: `{items, total, page, page_size, total_pages}`. `page_size` defaults to 10 and is capped at 100 (`util.ParsePage`).

Sorting is **always** server-side (`?sort=`/`?order=`, resolved by `util.OrderClause`). The sort key is interpolated into SQL, so it is resolved through a per-package whitelist — `postSortFields` / `projectSortFields` — and anything unrecognised silently falls back to the default order. Never build an `ORDER BY` from a raw query value. `OrderClause` also appends an `id` tiebreaker: without it, rows sharing an `updated_at` can swap places between requests and be duplicated or skipped across page boundaries.

Filtering belongs on the server for the same reason paging does. `GET /api/post?project=` takes `0` for "general" threads — no project parent, **or** a parent project that has since been deleted (`NOT EXISTS` against `projects`) — and `N` for one project's threads; omit it for all. The frontend used to apply this rule client-side; splitting it across the wire would page the unfiltered set and then filter it, showing short pages.

### `projects.updated_at` means "last activity", not "row last edited"
A project's place under `?sort=updated` and its "New" badge both read
`projects.updated_at`, and the frontend treats a project as fresh when its
newest **discussion** is recent. So `post.PostPost`/`post.PutPost` stamp the
parent project through `ProjectRepository.Touch` (declared in `internal/post`
as the one-method `ProjectToucher` interface, to keep `post` from importing
`project`) — a single-column write per post, instead of the project list
joining posts and taking a `MAX(updated_at)` for every row on every request.

Consequences worth knowing before you change it:
- An admin editing the project also counts as activity — that has always been
  the behavior, and `MarkSeen` on the project page records the same field.
- **Deleting** a discussion deliberately does not roll the stamp back: there is
  no separate record of the project's own last edit to fall back to.
- `ProjectRepository.BackfillActivity` runs at boot (`cmd/anoweb/main.go`) and
  lifts any project whose newest discussion is more recent than its
  `updated_at`. It is idempotent — once caught up, it matches no rows.

### Database
`internal/store/database.go` only wires **MySQL** via GORM, despite `gorm.io/driver/sqlite` appearing in `go.mod`. Production and local both hit MySQL (production MySQL runs on the host, listening on `127.0.0.1:3306` — reachable from the container thanks to host networking). There are currently no test files; when adding tests, exercise pure functions and avoid the DB entirely — isolate testable logic from GORM calls.

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

### Write protection
One system only: cookie sessions + `AdminMiddleware`. Owner content (profile, experience, education, project, core-skill, blog, announcements, mystery codes, guest popup) is admin-only on writes; forum posts are writable by any signed-in fan with author/admin checks on edit and delete; the generic image upload (`/api/static/upload-image`) is open to any signed-in fan (feeds forum post editors as well as admin editors — no file-size cap; raster images above 1920px are downscaled and recompressed, and SVGs are validated against script content); reads are public. The legacy `KeyChecker`/`ADMIN_PASS`/`KEY` system was removed in 2026-08 — `ADMIN_PASS` and `KEY` env vars are no longer read.

### Image uploads
`internal/static/handler.go` writes uploads to `IMG_PATH` (`/data/images` inside the container → `/home/Zhou/apps/anoweb/images` on the host) and returns `IMG_URL_PREFIX` + filename (`/image/...`). The backend never serves the files — Caddy does.

## House rules (from AGENTS.md)

- Don't bump existing dependency versions. Adding new dependencies is fine.
- Match the existing code and UI style. UI aesthetic targets Google's visual style; keep component copy terse — avoid verbose descriptions or instructional text inside UI components.
