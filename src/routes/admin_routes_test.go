package routes

import (
	"encoding/json"
	"net/http"
	"testing"
)

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

	w = performRequest(router, http.MethodPost, "/api/admin/logout", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected logout to return status %d, got %d", http.StatusOK, w.Code)
	}
}
