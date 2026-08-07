# zhouzhouzhang.co.uk

My web. Go/Gin backend. The React frontend is a separate project: `~/projects/anoweb-front`.

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
