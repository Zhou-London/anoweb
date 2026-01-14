package config

import "os"

type Config struct {
	SERVER_PORT string
	DOMAIN      string
	ADMIN_PASS  string

	DBUSER string
	DBPASS string
	DBHOST string
	DBPORT string
	DBNAME string

	IMG_PATH       string
	IMG_URL_PREFIX string
	FRONTEND_URL   string

	GOOGLE_CLIENT_ID     string
	GOOGLE_CLIENT_SECRET string
	GOOGLE_REDIRECT_URL  string
}

func Load() Config {
	env := os.Getenv("APP_ENV")
	if env == "production" {
		return Config{
			SERVER_PORT:          os.Getenv("PORT"),
			DOMAIN:               os.Getenv("DOMAIN"),
			ADMIN_PASS:           os.Getenv("ADMIN_PASS"),
			DBUSER:               os.Getenv("DBUSER"),
			DBPASS:               os.Getenv("DBPASS"),
			DBHOST:               os.Getenv("DBHOST"),
			DBPORT:               os.Getenv("DBPORT"),
			DBNAME:               os.Getenv("DBNAME"),
			IMG_PATH:             os.Getenv("IMG_PATH"),
			IMG_URL_PREFIX:       os.Getenv("IMG_URL_PREFIX"),
			FRONTEND_URL:         os.Getenv("FRONTEND_URL"),
			GOOGLE_CLIENT_ID:     os.Getenv("GOOGLE_CLIENT_ID"),
			GOOGLE_CLIENT_SECRET: os.Getenv("GOOGLE_CLIENT_SECRET"),
			GOOGLE_REDIRECT_URL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		}
	}
	// Default to development settings or load from .env
	return Config{
		SERVER_PORT:          os.Getenv("PORT"),
		DOMAIN:               os.Getenv("DOMAIN"),
		ADMIN_PASS:           os.Getenv("ADMIN_PASS"),
		DBUSER:               os.Getenv("DBUSER"),
		DBPASS:               os.Getenv("DBPASS"),
		DBHOST:               os.Getenv("DBHOST"),
		DBPORT:               os.Getenv("DBPORT"),
		DBNAME:               os.Getenv("DBNAME_TEST"),
		IMG_PATH:             os.Getenv("IMG_PATH"),
		IMG_URL_PREFIX:       os.Getenv("IMG_URL_PREFIX"),
		FRONTEND_URL:         os.Getenv("FRONTEND_URL"),
		GOOGLE_CLIENT_ID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GOOGLE_CLIENT_SECRET: os.Getenv("GOOGLE_CLIENT_SECRET"),
		GOOGLE_REDIRECT_URL:  os.Getenv("GOOGLE_REDIRECT_URL"),
	}
}
