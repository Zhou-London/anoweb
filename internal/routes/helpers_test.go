package routes

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

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
	"anonchihaya.co.uk/internal/statistics"
	"anonchihaya.co.uk/internal/store"
	"anonchihaya.co.uk/internal/tracking"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	testDomain = "example.com"
	testAdmin  = "admin-pass"
	testKey    = "test-key"
	testImgDir = "/tmp"
	testImgURL = "/public"
)

func setupTestDatabase(t *testing.T) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test database: %v", err)
	}

	if err := db.AutoMigrate(
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
		t.Fatalf("failed to migrate test database: %v", err)
	}

	store.DB = db
}

func setupRouter(t *testing.T) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)
	setupTestDatabase(t)

	profileRepo := profile.NewProfileRepository()
	experiencesRepo := experience.NewExperienceRepository()
	educationsRepo := education.NewEducationRepository()
	projectsRepo := project.NewProjectRepository()
	postsRepo := post.NewPostRepository()
	fanRepo := auth.NewFanRepository()
	sessionRepo := auth.NewSessionRepository()
	trackingRepo := tracking.NewFanTrackingRepository(store.DB)
	mysteryCodeRepo := mysterycode.NewMysteryCodeRepository(store.DB)
	popupRepo := guestpopup.NewGuestPopupConfigRepository(store.DB)
	statsRepo := statistics.NewStatisticsRepository(store.DB)
	coreSkillRepo := coreskill.NewCoreSkillRepository()

	r := gin.Default()
	InitRoutes(r, testDomain, testAdmin, testKey, testImgDir, testImgURL,
		profileRepo, experiencesRepo, educationsRepo, projectsRepo, postsRepo, fanRepo, sessionRepo,
		trackingRepo, mysteryCodeRepo, popupRepo, statsRepo, coreSkillRepo)

	return r
}

func performRequest(r http.Handler, method, path string, body []byte) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, bytes.NewBuffer(body))
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}
