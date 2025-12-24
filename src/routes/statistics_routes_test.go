package routes

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStatisticsOverall(t *testing.T) {
	r := setupRouter(t)

	w := performRequest(r, http.MethodGet, "/api/statistics/overall", nil)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check that all expected fields are present
	assert.Contains(t, response, "total_users")
	assert.Contains(t, response, "unique_visitors_ever")
	assert.Contains(t, response, "unique_visitors_24h")
	assert.Contains(t, response, "registered_visitors_ever")
	assert.Contains(t, response, "guest_visitors_ever")
	assert.Contains(t, response, "registered_visitors_24h")
	assert.Contains(t, response, "guest_visitors_24h")
	assert.Contains(t, response, "active_users_today")
	assert.Contains(t, response, "total_hours")
}

func TestUsersOverTime(t *testing.T) {
	r := setupRouter(t)

	w := performRequest(r, http.MethodGet, "/api/statistics/users-over-time?hours=24", nil)

	assert.Equal(t, http.StatusOK, w.Code)

	// Response should be valid JSON (array or null)
	assert.True(t, json.Valid(w.Body.Bytes()), "Response should be valid JSON")
}

func TestDailyActiveUsers(t *testing.T) {
	r := setupRouter(t)

	w := performRequest(r, http.MethodGet, "/api/statistics/daily-active?days=7", nil)

	assert.Equal(t, http.StatusOK, w.Code)

	// Response should be valid JSON (array or null)
	assert.True(t, json.Valid(w.Body.Bytes()), "Response should be valid JSON")
}
