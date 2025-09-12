package repositories

import (
	"database/sql"
	"log"

	"github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDatabase(usr string, pass string, host string, port string, name string) {

	cfg := mysql.NewConfig()
	cfg.User = usr
	cfg.Passwd = pass
	cfg.Net = "tcp"
	cfg.Addr = host + ":" + port
	cfg.DBName = name

	var err error
	DB, err = sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	pingErr := DB.Ping()
	if pingErr != nil {
		log.Fatal(pingErr)
	}
}
