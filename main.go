package main

import (
	"log"
	"os"

	"anonchihaya.co.uk/repositories"
	"anonchihaya.co.uk/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var r = gin.Default()
var PORT string
var DBUSER string
var DBPASS string
var DBHOST string
var DBPORT string
var DBNAME string

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	PORT = os.Getenv("PORT")
	DBUSER = os.Getenv("DBUSER")
	DBPASS = os.Getenv("DBPASS")
	DBHOST = os.Getenv("DBHOST")
	DBPORT = os.Getenv("DBPORT")
	DBNAME = os.Getenv("DBNAME")

	if PORT == "" || DBUSER == "" || DBPASS == "" || DBHOST == "" || DBPORT == "" || DBNAME == "" {
		log.Fatal("Error configuring database from .env file")
	}
	repositories.InitDatabase(DBUSER, DBPASS, DBHOST, DBPORT, DBNAME)
	defer repositories.DB.Close()

	routes.InitRoutes(r)
	r.Run("localhost:" + PORT)
}
