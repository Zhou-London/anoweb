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

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	PORT := os.Getenv("PORT")
	DBUSER := os.Getenv("DBUSER")
	DBPASS := os.Getenv("DBPASS")
	DBHOST := os.Getenv("DBHOST")
	DBPORT := os.Getenv("DBPORT")
	DBNAME := os.Getenv("DBNAME")

	if PORT == "" || DBUSER == "" || DBPASS == "" || DBHOST == "" || DBPORT == "" || DBNAME == "" {
		log.Fatal("Error configuring database from .env file")
	}
	repositories.InitDatabase(DBUSER, DBPASS, DBHOST, DBPORT, DBNAME)
	defer repositories.DB.Close()

	profile_repo := repositories.NewProfileRepository()

	routes.InitRoutes(r, profile_repo)
	r.Run("localhost:" + PORT)
}
