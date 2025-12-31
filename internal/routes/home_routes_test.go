package routes

import (
	"encoding/json"
	"net/http"
	"testing"
)

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
