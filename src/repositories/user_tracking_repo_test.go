package repositories

import (
	"fmt"
	"math"
	"testing"
	"time"

	"anonchihaya.co.uk/src/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTrackingRepo(t *testing.T) *FanTrackingRepository {
	t.Helper()

	dsn := fmt.Sprintf("file:tracking_%d?mode=memory&cache=shared", time.Now().UnixNano())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test database: %v", err)
	}

	if err := db.AutoMigrate(&models.FanTracking{}); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	return NewFanTrackingRepository(db)
}

func forceTimestamps(repo *FanTrackingRepository, tracking *models.FanTracking) {
	repo.db.Exec(
		"UPDATE user_trackings SET created_at = ?, updated_at = ?, start_time = ? WHERE id = ?",
		tracking.CreatedAt, tracking.UpdatedAt, tracking.StartTime, tracking.ID,
	)
	if tracking.EndTime != nil {
		repo.db.Exec("UPDATE user_trackings SET end_time = ? WHERE id = ?", tracking.EndTime, tracking.ID)
	}
}

func TestStartTrackingSkipsGuests(t *testing.T) {
	repo := setupTrackingRepo(t)

	tracking, err := repo.StartTracking(nil, "sess-guest")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if tracking != nil {
		t.Fatalf("expected nil tracking for guest start, got %+v", tracking)
	}

	var count int64
	if err := repo.db.Model(&models.FanTracking{}).Count(&count).Error; err != nil {
		t.Fatalf("failed to count records: %v", err)
	}
	if count != 0 {
		t.Fatalf("expected no tracking records, got %d", count)
	}
}

func TestStartTrackingFinalizesExistingSessions(t *testing.T) {
	repo := setupTrackingRepo(t)
	start := time.Now().Add(-10 * time.Minute)

	userID := uint(1)
	existing := &models.FanTracking{
		FanID:     &userID,
		SessionID: "sess-1",
		StartTime: start,
		Duration:  120,
		CreatedAt: start,
		UpdatedAt: start.Add(120 * time.Second),
	}

	if err := repo.db.Create(existing).Error; err != nil {
		t.Fatalf("failed to seed existing session: %v", err)
	}
	forceTimestamps(repo, existing)

	if _, err := repo.StartTracking(&userID, "sess-1"); err != nil {
		t.Fatalf("failed to start tracking: %v", err)
	}

	// The existing session should be finalized
	var finalized models.FanTracking
	if err := repo.db.First(&finalized, existing.ID).Error; err != nil {
		t.Fatalf("failed to fetch existing session: %v", err)
	}
	if finalized.EndTime == nil {
		t.Fatalf("expected existing session to be ended")
	}
	if finalized.Duration != 120 {
		t.Fatalf("expected duration to remain 120, got %d", finalized.Duration)
	}

	// A new active session for the user should exist
	var activeCount int64
	if err := repo.db.Model(&models.FanTracking{}).
		Where("session_id = ? AND end_time IS NULL", "sess-1").
		Count(&activeCount).Error; err != nil {
		t.Fatalf("failed to count active sessions: %v", err)
	}
	if activeCount != 1 {
		t.Fatalf("expected one active session after start, got %d", activeCount)
	}
}

func TestEndTrackingUsesRecordedDurationAfterInactivity(t *testing.T) {
	repo := setupTrackingRepo(t)
	start := time.Now().Add(-10 * time.Minute)
	userID := uint(1)

	tracking := &models.FanTracking{
		FanID:     &userID,
		SessionID: "sess-2",
		StartTime: start,
		Duration:  120,
		CreatedAt: start,
		UpdatedAt: start.Add(2 * time.Minute),
	}

	if err := repo.db.Create(tracking).Error; err != nil {
		t.Fatalf("failed to seed session: %v", err)
	}
	forceTimestamps(repo, tracking)

	if err := repo.EndTracking("sess-2", &userID); err != nil {
		t.Fatalf("failed to end tracking: %v", err)
	}

	var ended models.FanTracking
	if err := repo.db.First(&ended, tracking.ID).Error; err != nil {
		t.Fatalf("failed to fetch ended session: %v", err)
	}

	if ended.EndTime == nil {
		t.Fatalf("expected session to have end_time set")
	}
	if ended.Duration != 120 {
		t.Fatalf("expected duration to remain 120 after end, got %d", ended.Duration)
	}
}

func TestGetTotalHoursIgnoresGuestsAndStaleGrowth(t *testing.T) {
	repo := setupTrackingRepo(t)
	now := time.Now()
	userID := uint(42)

	// Completed user session
	endedStart := now.Add(-2 * time.Hour)
	endedDuration := int64(120)
	endedTime := endedStart.Add(time.Duration(endedDuration) * time.Second)
	ended := &models.FanTracking{
		FanID:     &userID,
		SessionID: "ended",
		StartTime: endedStart,
		Duration:  endedDuration,
		EndTime:   &endedTime,
		CreatedAt: endedStart,
		UpdatedAt: endedTime,
	}

	// Active user session that hasn't been updated recently
	activeStart := now.Add(-30 * time.Minute)
	activeDuration := int64(60)
	active := &models.FanTracking{
		FanID:     &userID,
		SessionID: "active",
		StartTime: activeStart,
		Duration:  activeDuration,
		CreatedAt: activeStart,
		UpdatedAt: activeStart.Add(time.Duration(activeDuration) * time.Second),
	}

	// Active guest session that should not contribute
	guestStart := now.Add(-1 * time.Hour)
	guestDuration := int64(500)
	guest := &models.FanTracking{
		SessionID: "guest",
		StartTime: guestStart,
		Duration:  guestDuration,
		CreatedAt: guestStart,
		UpdatedAt: guestStart.Add(time.Duration(guestDuration) * time.Second),
	}

	if err := repo.db.Create(ended).Error; err != nil {
		t.Fatalf("failed to seed ended session: %v", err)
	}
	forceTimestamps(repo, ended)
	if err := repo.db.Create(active).Error; err != nil {
		t.Fatalf("failed to seed active session: %v", err)
	}
	forceTimestamps(repo, active)
	if err := repo.db.Create(guest).Error; err != nil {
		t.Fatalf("failed to seed guest session: %v", err)
	}
	forceTimestamps(repo, guest)

	var storedActive models.FanTracking
	if err := repo.db.Where("session_id = ?", "active").First(&storedActive).Error; err != nil {
		t.Fatalf("failed to fetch active session: %v", err)
	}
	t.Logf("active session start=%s updated=%s duration=%d now=%s diff=%s",
		storedActive.StartTime.Format(time.RFC3339),
		storedActive.UpdatedAt.Format(time.RFC3339),
		storedActive.Duration,
		time.Now().Format(time.RFC3339),
		time.Since(storedActive.UpdatedAt),
	)

	totalHours, err := repo.GetTotalHours()
	if err != nil {
		t.Fatalf("failed to get total hours: %v", err)
	}

	expectedSeconds := float64(endedDuration + activeDuration)
	expectedHours := expectedSeconds / 3600.0
	if math.Abs(totalHours-expectedHours) > 1e-9 {
		t.Fatalf("expected total hours %.9f, got %.9f", expectedHours, totalHours)
	}
}
