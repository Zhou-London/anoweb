package routes

import (
	"net/http"
	"testing"
)

func TestSwaggerIsServedUnderApiPrefix(t *testing.T) {
	router := setupRouter(t)

	w := performRequest(router, http.MethodGet, "/api/swagger/index.html", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	w = performRequest(router, http.MethodGet, "/api/swagger/doc.json", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}
}
