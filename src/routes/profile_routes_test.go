package routes

import (
	"encoding/json"
	"net/http"
	"testing"

	"anonchihaya.co.uk/src/models"
)

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
