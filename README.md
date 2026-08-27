<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:0F172A,50:0EA5E9,100:00ADD8&text=anoweb&fontSize=72&fontColor=FFFFFF&fontAlignY=36&desc=Go%20%C2%B7%20Gin%20backend%20for%20zhouzhouzhang.co.uk&descSize=16&descAlignY=56&animation=fadeIn&section=header" alt="anoweb" />

![Release](https://img.shields.io/badge/release-v1.4-22C55E?style=for-the-badge)
![Go](https://img.shields.io/badge/Go-1.25-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Gin](https://img.shields.io/badge/Gin-1.10-008ECF?style=for-the-badge&logo=gin&logoColor=white)
![MySQL](https://img.shields.io/badge/GORM-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Caddy](https://img.shields.io/badge/Caddy-reverse%20proxy-1F88C0?style=for-the-badge&logo=caddy&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-API%20docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Site](https://img.shields.io/badge/live-zhouzhouzhang.co.uk-0EA5E9?style=for-the-badge&logo=googlechrome&logoColor=white)

</div>

# zhouzhouzhang.co.uk

My web. Go/Gin backend. The React frontend is a separate project: `~/projects/anoweb-front`.

## Release notes

### v1.4 — 2026-08-17

<div align="center">

![Projects](https://img.shields.io/badge/projects-ranked%20by%20discussion-0EA5E9?style=flat-square)
![Denormalised](https://img.shields.io/badge/updated__at-stamped%20on%20write-6366F1?style=flat-square)
![Migration](https://img.shields.io/badge/backfill-idempotent-22C55E?style=flat-square)

</div>

- **Projects rank by their newest discussion.** `POST`/`PUT /api/post` stamp the parent project's `updated_at` (`ProjectRepository.Touch`), so `/api/project?sort=updated` and the frontend's "New" badge follow forum activity — one single-column write per post instead of a `MAX(updated_at)` join on every list request.
- `ProjectRepository.BackfillActivity()` runs once at boot to lift existing rows; idempotent, and a project edited *after* its last post is left alone.
- Limits: deleting a thread does not roll the stamp back, and comments do not count as activity.

### v1.3 — 2026-08-17

<div align="center">

![Sorting](https://img.shields.io/badge/lists-server--side%20sort-0EA5E9?style=flat-square)
![Paging](https://img.shields.io/badge/paging-10%20per%20page-6366F1?style=flat-square)
![Filter](https://img.shields.io/badge/forum-server--side%20filter-14B8A6?style=flat-square)
![Safety](https://img.shields.io/badge/ORDER%20BY-whitelisted-22C55E?style=flat-square)

</div>

- **Server-side paging.** `/api/post`, `/api/post/project/:id`, `/api/project` and `/api/blog` take `?page=` / `?page_size=` (default 10, max 100) and answer with `{items, total, page, page_size, total_pages}`. Without `?page=` they still return the bare array the sitemap, home page and admin managers consume; empty pages serialise as `[]`.
- **Server-side sorting.** `?sort=name|updated|created` with `?order=asc|desc` on the forum and project lists. Keys are whitelisted (`util.OrderClause`) before reaching `ORDER BY`, and an `id` tiebreaker keeps pages stable.
- **Server-side forum filter.** `/api/post?project=` — `0` for general or orphaned threads, `N` for one project — so the pager counts the filtered set.
- `/api/post/latest` now orders by `updated_at`, so editing an old thread counts as activity.
- Known issue: `swag init` cannot regenerate `docs/` on this tree (pre-existing), so Swagger UI still shows the old signatures for these endpoints.

### v1.2 — 2026-08-17

<div align="center">

![Uploads](https://img.shields.io/badge/uploads-SVG%20support-FFB13B?style=flat-square&logo=svg&logoColor=white)
![Auth](https://img.shields.io/badge/upload-open%20to%20fans-8B5CF6?style=flat-square)
![Storage](https://img.shields.io/badge/images-orphan%20GC-14B8A6?style=flat-square)
![Stats](https://img.shields.io/badge/blog%20views-24h%20dedup-0EA5E9?style=flat-square)

</div>

**Added**

- **SVG uploads.** `util.ValidateSVG` (`internal/util/svg.go`) parses every uploaded SVG and rejects `<script>`/`<foreignObject>` elements, `on*` event-handler attributes and `javascript:`/non-image `data:` URLs — a scripted SVG served from the site origin would run with first-party cookies. Rejections map to `400` via `util.ErrUnsafeSVG`; covered by `internal/util/svg_test.go`.
- **Orphan-image garbage collection.** New `internal/cleanup` package sweeps `IMG_PATH` at startup and every 48h, deleting files no DB record references. It scans both URL columns and markdown bodies across blog, post, announcement, project, experience, education, learning, fan and comment; files younger than 24h are spared so images in unsaved drafts survive.
- **Bullet points on education & experience.** `BulletPoints []string` stored as a JSON column on both models.

**Changed**

- **`POST /api/static/upload-image` is open to any signed-in fan** (`AdminMiddleware` dropped, `AuthMiddleware` kept), so forum post editors can attach images alongside the admin content editors.
- **Blog views are deduplicated per visitor over a 24h window** (`internal/blog/view_dedup.go`) — keyed on `session_token` for members, a hash of IP + User-Agent for anonymous visitors. Repeat opens no longer inflate the counter.
- Education/experience `start_date` and `end_date` are nullable (`*string`): an empty value now stores as `NULL` instead of `''`, which MySQL rejects for `DATE` columns in strict mode.
- PNG re-encoding uses `png.BestCompression`; the accepted-extension check moved to `filepath.Ext` and now includes `.svg`.
- `docs/Caddyfile` updated for the new upload/image routing.

<details>
<summary><b>v1.1</b> — 2026-08-04</summary>

Baseline release. See `git log 1450c6e` for the full history.

</details>

## Server layout

| Path | Role |
| --- | --- |
| `/home/Zhou/projects/anoweb` | backend source — compile & Docker build happen here |
| `/home/Zhou/projects/anoweb-front` | frontend source — builds the static site |
| `/home/Zhou/apps/anoweb` | runtime — `docker-compose.yml`, `.env`, `www/` (SPA), `images/` (uploads) |

Caddy runs as a container too (tracked config in `docs/Caddyfile`, bind-mounted to `~/apps/anoweb/Caddyfile`). It proxies `/api*` to the backend, serves `/image/*` from `~/apps/anoweb/images` and sends everything else to the Next.js container.

## Deploy backend

The Go compile runs inside Docker (single-stage image, host networking).

```zsh
$ cd ~/apps/anoweb
$ docker compose up -d --build anoweb
```

Logs:

```zsh
$ docker logs -f anoweb
```

## Deploy frontend

```zsh
$ cd ~/apps/anoweb
$ docker compose up -d --build frontend
```

Builds the Next.js image from `~/projects/anoweb-front`. Deploy host only.

## Caddy

```zsh
$ cat docs/Caddyfile > ~/apps/anoweb/Caddyfile
$ docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

The Caddyfile is bind-mounted **as a single file**, so overwrite it in place
(`cat >`) — anything that replaces the inode leaves the container pinned to the
old one.

## Local development

```zsh
$ go build ./cmd/anoweb/
$ go test ./...
$ go run ./cmd/anoweb/   # needs a .env file, see env-example
```

## API Docs

Swagger UI is served at `/api/swagger/index.html`

Regenerate docs after API changes:

```zsh
$ go install github.com/swaggo/swag/cmd/swag@v1.16.6
$ swag init -g cmd/anoweb/main.go -o ./docs
```

## AI Coding

Use codex-cli, claude code and Manus. My favourite models by far:

-   GPT 5.2 Medium
-   Sonnet 4.5
-   Manus 1.6 Pro

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=0:00ADD8,50:0EA5E9,100:0F172A&section=footer" alt="" />

</div>
