<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:0F172A,50:0EA5E9,100:00ADD8&text=anoweb&fontSize=72&fontColor=FFFFFF&fontAlignY=36&desc=Go%20%C2%B7%20Gin%20backend%20for%20zhouzhouzhang.co.uk&descSize=16&descAlignY=56&animation=fadeIn&section=header" alt="anoweb" />

![Release](https://img.shields.io/badge/release-v1.3-22C55E?style=for-the-badge)
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

### v1.3 — 2026-08-17

<div align="center">

![Sorting](https://img.shields.io/badge/lists-server--side%20sort-0EA5E9?style=flat-square)
![Paging](https://img.shields.io/badge/paging-10%20per%20page-6366F1?style=flat-square)
![Filter](https://img.shields.io/badge/forum-server--side%20filter-14B8A6?style=flat-square)
![Safety](https://img.shields.io/badge/ORDER%20BY-whitelisted-22C55E?style=flat-square)

</div>

**Added**

- **Sorting and paging on the list endpoints, done entirely in SQL.** `/api/post`, `/api/post/project/:id`, `/api/project` and `/api/blog` accept `?page=` / `?page_size=` (default 10, capped at 100) and answer with a `util.PagedResponse` envelope — `{items, total, page, page_size, total_pages}`. Without `?page=` they return the same bare array as before, which is what the sitemap, the home page and the admin managers consume.
- **`?sort=name|updated|created` with `?order=asc|desc`** on the forum and project lists. The key is resolved through a per-package whitelist (`util.OrderClause`) because it is interpolated into `ORDER BY`; unknown keys fall back to the default order instead of erroring. An `id` tiebreaker is always appended — rows sharing an `updated_at` would otherwise be free to swap places between requests and get duplicated or skipped across a page boundary.
- **Server-side forum filtering: `/api/post?project=`.** `0` selects general threads — no project parent, *or* a parent project that has since been deleted — and `N` selects one project's threads. This rule used to live in the frontend; leaving it there would have paged the unfiltered set and then filtered it.
- Unit tests for both helpers (`internal/util/paging_test.go`, `sorting_test.go`), including a case that pins the `ORDER BY` whitelist against injection attempts.

**Changed**

- `/api/post/latest` now returns the most recently **updated** thread rather than the most recently created one, so an edit to an old thread also lights the header's "New" dot.
- `internal/post` gained `ListWithAuthor(PostQuery)` and `ListShortByProject`, replacing `GetAllWithAuthor`/`GetShortByProject`; `internal/project` gained `List(ProjectQuery)` and `internal/blog` gained `List(limit, offset)`. Each returns the pre-paging total alongside the rows so a handler can size a pager in one round trip.
- Empty pages serialise as `[]` rather than `null`.

**Known issue**

- `swag init` cannot regenerate `docs/` on this tree — it fails to resolve the request types in `internal/api/swagger_models.go` from the handler comments, which predates this release. The new `@Param` annotations are in the source but Swagger UI still shows the old signatures for these four endpoints.

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

Caddy (`/etc/caddy/Caddyfile`, tracked copy in `docs/Caddyfile`) proxies `/api*` to `localhost:8080`, serves `/image/*` from `~/apps/anoweb/images` and everything else from `~/apps/anoweb/www`.

## Deploy backend

The Go compile runs inside Docker (single-stage image, host networking).

```zsh
$ cd ~/apps/anoweb
$ docker compose up -d --build --force-recreate anoweb
```

`--force-recreate` is required — on the host's compose 2.37.1 a plain `up -d --build` rebuilds the image but leaves the container running the old one. Verify with `docker inspect --format '{{.Image}}' anoweb` against `docker inspect --format '{{.Id}}' anoweb:latest`.

Logs:

```zsh
$ docker logs -f anoweb
```

## Deploy frontend

```zsh
$ cd ~/projects/anoweb-front
$ npm run build
```

Writes the prerendered SPA straight into `~/apps/anoweb/www`. Deploy host only.

## Caddy

```zsh
$ sudo cp docs/Caddyfile /etc/caddy/Caddyfile
$ sudo systemctl reload caddy
```

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
