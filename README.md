<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:0F172A,50:0EA5E9,100:00ADD8&text=anoweb&fontSize=72&fontColor=FFFFFF&fontAlignY=36&desc=Go%20%C2%B7%20Gin%20backend%20for%20zhouzhouzhang.co.uk&descSize=16&descAlignY=56&animation=fadeIn&section=header" alt="anoweb" />

![Release](https://img.shields.io/badge/release-v1.2-22C55E?style=for-the-badge)
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
$ docker compose up -d --build
```

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
