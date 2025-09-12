package repositories

import (
	"database/sql"
	"log"

	"github.com/go-sql-driver/mysql"
)

func InitDatabase(usr string, pass string, host string, port string, name string) *sql.DB {

	cfg := mysql.NewConfig()
	cfg.User = usr
	cfg.Passwd = pass
	cfg.Net = "tcp"
	cfg.Addr = host + ":" + port
	cfg.DBName = name

	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	pingErr := db.Ping()
	if pingErr != nil {
		log.Fatal(pingErr)
	}

	return db
}
