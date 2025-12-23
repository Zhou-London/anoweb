# zhouzhouzhang.co.uk

My web.

## Install

Build Go application.

```zsh
$ cd <root-dir>
$ go build -o <wherever> ./src
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