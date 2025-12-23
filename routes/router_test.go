package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"anonchihaya.co.uk/models"
	"anonchihaya.co.uk/repositories"
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
		&models.Profile{},
		&models.Experience{},
		&models.Education{},
		&models.Project{},
		&models.Learning{},
		&models.Post{},
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

	r := gin.Default()
	InitRoutes(r, testDomain, testAdmin, testKey, testImgDir, testImgURL,
		profileRepo, experiencesRepo, educationsRepo, projectsRepo, postsRepo)

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

func TestHomeEndpoint(t *testing.T) {
	router := setupRouter(t)

	w := performRequest(router, http.MethodGet, "/api/home", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var res map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	if res["message"] == "" {
		t.Fatalf("expected home message, got empty string")
	}
}

func TestAdminCheck(t *testing.T) {
	router := setupRouter(t)

	successBody, _ := json.Marshal(map[string]string{"pass": testAdmin})
	w := performRequest(router, http.MethodPost, "/api/admin", successBody)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	if cookie := w.Header().Get("Set-Cookie"); cookie == "" {
		t.Fatalf("expected admin cookie to be set")
	}

	failBody, _ := json.Marshal(map[string]string{"pass": "wrong"})
	w = performRequest(router, http.MethodPost, "/api/admin", failBody)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized status, got %d", w.Code)
	}
}

func TestProfileCRUD(t *testing.T) {
	router := setupRouter(t)

	createPayload, _ := json.Marshal(map[string]string{
		"key":      testKey,
		"name":     "Tester",
		"email":    "tester@example.com",
		"github":   "tester-gh",
		"linkedin": "tester-li",
		"bio":      "initial bio",
	})

	createResp := performRequest(router, http.MethodPost, "/api/profile", createPayload)
	if createResp.Code != http.StatusOK {
		t.Fatalf("expected create status %d, got %d", http.StatusOK, createResp.Code)
	}

	getResp := performRequest(router, http.MethodGet, "/api/profile", nil)
	if getResp.Code != http.StatusOK {
		t.Fatalf("expected get status %d, got %d", http.StatusOK, getResp.Code)
	}

	var profile models.Profile
	if err := json.Unmarshal(getResp.Body.Bytes(), &profile); err != nil {
		t.Fatalf("failed to decode profile: %v", err)
	}

	if profile.Name != "Tester" || profile.Email != "tester@example.com" {
		t.Fatalf("unexpected profile data: %+v", profile)
	}

	updatePayload, _ := json.Marshal(map[string]interface{}{
		"key":   testKey,
		"id":    profile.ID,
		"bio":   "updated bio",
		"email": "tester@new.com",
	})
	updateResp := performRequest(router, http.MethodPut, "/api/profile", updatePayload)
	if updateResp.Code != http.StatusOK {
		t.Fatalf("expected update status %d, got %d", http.StatusOK, updateResp.Code)
	}

	verifyResp := performRequest(router, http.MethodGet, "/api/profile", nil)
	if verifyResp.Code != http.StatusOK {
		t.Fatalf("expected get status %d, got %d", http.StatusOK, verifyResp.Code)
	}

	var updated models.Profile
	if err := json.Unmarshal(verifyResp.Body.Bytes(), &updated); err != nil {
		t.Fatalf("failed to decode updated profile: %v", err)
	}

	if updated.Bio != "updated bio" || updated.Email != "tester@new.com" {
		t.Fatalf("profile not updated: %+v", updated)
	}

	deleteResp := performRequest(router, http.MethodDelete, "/api/profile?key="+testKey, nil)
	if deleteResp.Code != http.StatusOK {
		t.Fatalf("expected delete status %d, got %d", http.StatusOK, deleteResp.Code)
	}
}
