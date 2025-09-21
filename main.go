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

	// * DB
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
	experiences_repo := repositories.NewExperienceRepository()
	educations_repo := repositories.NewEducationRepository()
	projects_repo := repositories.NewProjectRepository()
	posts_repo := repositories.NewPostRepository()

	// * Basic Information
	DOMAIN := os.Getenv("DOMAIN")
	if DOMAIN == "" {
		log.Fatal("Error configuring domain from .env file")
	}

	// * Authorization
	KEY := os.Getenv("KEY")
	ADMIN_PASS := os.Getenv("ADMIN_PASS")
	if KEY == "" || ADMIN_PASS == "" {
		log.Fatal("Error configuring key from .env file")
	}

	// * Image
	IMG_PATH := os.Getenv("IMG_PATH")
	IMG_URL_PREFIX := os.Getenv("IMG_URL_PREFIX")

	routes.InitRoutes(r, DOMAIN, ADMIN_PASS, KEY, IMG_PATH, IMG_URL_PREFIX, profile_repo, experiences_repo, educations_repo, projects_repo, posts_repo)
	r.Run("localhost:" + PORT)
}
