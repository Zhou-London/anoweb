package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/util"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupFanTestRouter(t *testing.T) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)
	setupTestDatabase(t)

	userRepo := auth.NewFanRepository()
	sessionRepo := auth.NewSessionRepository()

	r := gin.Default()
	registerFanRoutes(r, "localhost", "/tmp/test_images", "http://localhost/images/", userRepo, sessionRepo)

	return r
}

func TestFanRegistration(t *testing.T) {

	r := setupFanTestRouter(t)

	// Test successful registration
	t.Run("Successful Registration", func(t *testing.T) {
		reqBody := map[string]string{
			"username": "testuser",
			"email":    "test@example.com",
			"password": "password123",
		}
		jsonBody, _ := json.Marshal(reqBody)

		req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Fan registered successfully. Please check your email to verify your account.", response["message"])
	})

	// Test duplicate username
	t.Run("Duplicate Username", func(t *testing.T) {
		reqBody := map[string]string{
			"username": "testuser",
			"email":    "another@example.com",
			"password": "password123",
		}
		jsonBody, _ := json.Marshal(reqBody)

		req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusConflict, w.Code)
	})
}

func TestFanLogin(t *testing.T) {
	r := setupFanTestRouter(t)
	userRepo := auth.NewFanRepository()

	// Create a test user
	hashedPassword, _ := util.HashPassword("password123")
	testFan := &auth.Fan{
		Username:     "logintest",
		Email:        "login@example.com",
		PasswordHash: hashedPassword,
		IsAdmin:      false,
	}
	userRepo.Create(testFan)

	// Test successful login
	t.Run("Successful Login", func(t *testing.T) {
		reqBody := map[string]string{
			"username": "logintest",
			"password": "password123",
		}
		jsonBody, _ := json.Marshal(reqBody)

		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Login successful", response["message"])

		// Check if session cookie is set
		cookies := w.Result().Cookies()
		assert.NotEmpty(t, cookies)
	})

	// Test invalid password
	t.Run("Invalid Password", func(t *testing.T) {
		reqBody := map[string]string{
			"username": "logintest",
			"password": "wrongpassword",
		}
		jsonBody, _ := json.Marshal(reqBody)

		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test non-existent user
	t.Run("Non-existent User", func(t *testing.T) {
		reqBody := map[string]string{
			"username": "nonexistent",
			"password": "password123",
		}
		jsonBody, _ := json.Marshal(reqBody)

		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestFanLogout(t *testing.T) {
	r := setupFanTestRouter(t)

	// Test logout
	t.Run("Logout", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/auth/logout", nil)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		// Accept both messages since we're not logged in
		message := response["message"]
		assert.True(t, message == "Logged out successfully" || message == "Already logged out")
	})
}
