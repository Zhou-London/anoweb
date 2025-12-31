package main

import (
	"log"
	"os"

	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/coreskill"
	"anonchihaya.co.uk/internal/education"
	"anonchihaya.co.uk/internal/experience"
	"anonchihaya.co.uk/internal/guestpopup"
	"anonchihaya.co.uk/internal/learning"
	"anonchihaya.co.uk/internal/mysterycode"
	"anonchihaya.co.uk/internal/post"
	"anonchihaya.co.uk/internal/profile"
	"anonchihaya.co.uk/internal/project"
	"anonchihaya.co.uk/internal/routes"
	"anonchihaya.co.uk/internal/statistics"
	"anonchihaya.co.uk/internal/store"
	"anonchihaya.co.uk/internal/tracking"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var r = gin.Default()

// @title anoweb API
// @version 1.0
// @description Backend API documentation for anoweb.
// @BasePath /api
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
	store.InitDatabase(DBUSER, DBPASS, DBHOST, DBPORT, DBNAME)
	if err := store.DB.AutoMigrate(
		&auth.Fan{},
		&auth.Session{},
		&profile.Profile{},
		&experience.Experience{},
		&education.Education{},
		&project.Project{},
		&learning.Learning{},
		&post.Post{},
		&tracking.FanTracking{},
		&mysterycode.MysteryCode{},
		&guestpopup.GuestPopupConfig{},
		&coreskill.CoreSkill{},
	); err != nil {
		log.Fatal(err)
	}

	// Mark existing fans as verified (migration)
	fanRepoForMigration := auth.NewFanRepository()
	if err := fanRepoForMigration.MarkExistingFansAsVerified(); err != nil {
		log.Printf("Warning: Failed to mark existing fans as verified: %v", err)
	}

	sqlDB, err := store.DB.DB()
	if err != nil {
		log.Fatal(err)
	}
	defer sqlDB.Close()

	profile_repo := profile.NewProfileRepository()
	experiences_repo := experience.NewExperienceRepository()
	educations_repo := education.NewEducationRepository()
	projects_repo := project.NewProjectRepository()
	posts_repo := post.NewPostRepository()
	fan_repo := auth.NewFanRepository()
	session_repo := auth.NewSessionRepository()
	tracking_repo := tracking.NewFanTrackingRepository(store.DB)
	mystery_code_repo := mysterycode.NewMysteryCodeRepository(store.DB)
	popup_repo := guestpopup.NewGuestPopupConfigRepository(store.DB)
	stats_repo := statistics.NewStatisticsRepository(store.DB)
	core_skill_repo := coreskill.NewCoreSkillRepository()

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

	routes.InitRoutes(r, DOMAIN, ADMIN_PASS, KEY, IMG_PATH, IMG_URL_PREFIX, profile_repo, experiences_repo, educations_repo, projects_repo, posts_repo, fan_repo, session_repo, tracking_repo, mystery_code_repo, popup_repo, stats_repo, core_skill_repo)

	r.Run("localhost:" + PORT)
}
