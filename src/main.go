package main

import (
	"log"
	"os"

	"anonchihaya.co.uk/src/repositories"
	"anonchihaya.co.uk/src/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	// gd "github.com/kwkwc/gin-docs"
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

	sqlDB, err := repositories.DB.DB()
	if err != nil {
		log.Fatal(err)
	}
	defer sqlDB.Close()

	profile_repo := repositories.NewProfileRepository()
	experiences_repo := repositories.NewExperienceRepository()
	educations_repo := repositories.NewEducationRepository()
	projects_repo := repositories.NewProjectRepository()
	posts_repo := repositories.NewPostRepository()
	user_repo := repositories.NewUserRepository()
	session_repo := repositories.NewSessionRepository()
	tracking_repo := repositories.NewUserTrackingRepository(repositories.DB)
	mystery_code_repo := repositories.NewMysteryCodeRepository(repositories.DB)
	popup_repo := repositories.NewGuestPopupConfigRepository(repositories.DB)
	stats_repo := repositories.NewStatisticsRepository(repositories.DB)

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

	routes.InitRoutes(r, DOMAIN, ADMIN_PASS, KEY, IMG_PATH, IMG_URL_PREFIX, profile_repo, experiences_repo, educations_repo, projects_repo, posts_repo, user_repo, session_repo, tracking_repo, mystery_code_repo, popup_repo, stats_repo)

	// conf := (&gd.Config{}).Default()
	// apiDoc := gd.ApiDoc{
	// 	Ge:   r,
	// 	Conf: conf,
	// }
	// apiDoc.OfflineMarkdown("doc/api.md", true)
	r.Run("localhost:" + PORT)
}
