# zhouzhouzhang.co.uk

My web.

## Install

Build Go application.

```zsh
$ cd <root-dir>
$ go build -o ../../apps/anoweb ./cmd/anoweb/
```

Build React application.

```zsh
$ cd static/anoweb-front
$ npm run build
```

Deliver to a web server (Caddy am I using). Use whatever editor you wish.

```zsh
$ vim /etc/caddy/Caddyfile
```

Configure systemd

```zsh
% vim /etc/systemd/system/myserver.service
```

## API Docs

Swagger UI is served at `/api/swagger/index.html`ß

Regenerate docs after API changes:

```zsh
$ go install github.com/swaggo/swag/cmd/swag@v1.16.6
$ swag init -g src/main.go -d ./src -o ./docs
```

## AI Coding

Use codex-cli, claude code and Manus. My favourite models by far:

-   GPT 5.2 Medium
-   Sonnet 4.5
-   Manus 1.6 Pro