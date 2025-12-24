package routes

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
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
		&models.User{},
		&models.Session{},
		&models.Profile{},
		&models.Experience{},
		&models.Education{},
		&models.Project{},
		&models.Learning{},
		&models.Post{},
		&models.UserTracking{},
		&models.MysteryCode{},
		&models.GuestPopupConfig{},
	); err != nil {
		t.Fatalf("failed to migrate test database: %v", err)
	}

	repositories.DB = db
}

func setupRouter(t *testing.T) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)
	setupTestDatabase(t)

	profileRepo := repositories.NewProfileRepository()
	experiencesRepo := repositories.NewExperienceRepository()
	educationsRepo := repositories.NewEducationRepository()
	projectsRepo := repositories.NewProjectRepository()
	postsRepo := repositories.NewPostRepository()
	userRepo := repositories.NewUserRepository()
	sessionRepo := repositories.NewSessionRepository()
	trackingRepo := repositories.NewUserTrackingRepository(repositories.DB)
	mysteryCodeRepo := repositories.NewMysteryCodeRepository(repositories.DB)
	popupRepo := repositories.NewGuestPopupConfigRepository(repositories.DB)
	statsRepo := repositories.NewStatisticsRepository(repositories.DB)

	r := gin.Default()
	InitRoutes(r, testDomain, testAdmin, testKey, testImgDir, testImgURL,
		profileRepo, experiencesRepo, educationsRepo, projectsRepo, postsRepo, userRepo, sessionRepo,
		trackingRepo, mysteryCodeRepo, popupRepo, statsRepo)

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
