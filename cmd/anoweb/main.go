package main

import (
	"log"

	"anonchihaya.co.uk/internal/announcement"
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/blog"
	"anonchihaya.co.uk/internal/comment"
	"anonchihaya.co.uk/internal/config"
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

	CONFIG := config.Load()

	if CONFIG.SERVER_PORT == "" || CONFIG.DBUSER == "" || CONFIG.DBPASS == "" || CONFIG.DBHOST == "" || CONFIG.DBPORT == "" || CONFIG.DBNAME == "" {
		log.Fatal("Error configuring database from .env file")
	}
	store.InitDatabase(CONFIG.DBUSER, CONFIG.DBPASS, CONFIG.DBHOST, CONFIG.DBPORT, CONFIG.DBNAME)
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
		&blog.Blog{},
		&blog.BlogLike{},
		&announcement.Announcement{},
		&comment.Comment{},
		&comment.CommentLike{},
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
	blog_repo := blog.NewBlogRepository()
	blog_like_repo := blog.NewBlogLikeRepository()
	announcement_repo := announcement.NewAnnouncementRepository()
	comment_repo := comment.NewCommentRepository()

	if CONFIG.DOMAIN == "" {
		log.Fatal("Error configuring domain from .env file")
	}
	if CONFIG.IMG_PATH == "" {
		log.Fatal("Error configuring image path from .env file")
	}
	if CONFIG.IMG_URL_PREFIX == "" {
		log.Fatal("Error configuring image url prefix from .env file")
	}

	routes.InitRoutes(r, CONFIG.DOMAIN, CONFIG.IMG_PATH, CONFIG.IMG_URL_PREFIX, profile_repo, experiences_repo, educations_repo, projects_repo, posts_repo, fan_repo, session_repo, tracking_repo, mystery_code_repo, popup_repo, stats_repo, core_skill_repo, blog_repo, blog_like_repo, announcement_repo, comment_repo)

	host := CONFIG.LISTEN_HOST
	if host == "" {
		host = "localhost"
	}
	r.Run(host + ":" + CONFIG.SERVER_PORT)
}
