package repositories

import (
	"errors"
	"time"

	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

const inactiveSessionGracePeriod = 2 * time.Minute

type UserTrackingRepository struct {
	db *gorm.DB
}

func NewUserTrackingRepository(db *gorm.DB) *UserTrackingRepository {
	return &UserTrackingRepository{db: db}
}

// StartTracking creates a new tracking session
func (r *UserTrackingRepository) StartTracking(userID *uint, sessionID string) (*models.UserTracking, error) {
	// Do not track guests
	if userID == nil {
		return nil, nil
	}

	// End any lingering active sessions for this user before starting a new one
	// This ensures only one active session exists per user at any time
	if err := r.finalizeActiveSessionsForUser(userID); err != nil {
		return nil, err
	}

	tracking := &models.UserTracking{
		UserID:    userID,
		SessionID: sessionID,
		StartTime: time.Now(),
	}
	if err := r.db.Create(tracking).Error; err != nil {
		return nil, err
	}
	return tracking, nil
}

// EndTracking updates the tracking session with end time and duration
func (r *UserTrackingRepository) EndTracking(sessionID string, userID *uint) error {
	now := time.Now()
	var tracking models.UserTracking

	// Prioritize the most recent active session for this session ID
	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).
		Order("start_time DESC").
		First(&tracking).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}

	duration := calculateDuration(&tracking, now)
	updates := map[string]interface{}{
		"end_time": now,
		"duration": duration,
	}

	// Update user_id if provided and not already set
	if userID != nil && tracking.UserID == nil {
		updates["user_id"] = userID
	}

	if err := r.db.Model(&tracking).Updates(updates).Error; err != nil {
		return err
	}

	// Clean up any other active sessions tied to the same session ID
	return r.finalizeActiveSessions(sessionID)
}

// GetTotalHours returns total hours spent by all users
func (r *UserTrackingRepository) GetTotalHours() (float64, error) {
	// Sum completed sessions
	var completedSeconds int64
	if err := r.db.Model(&models.UserTracking{}).
		Where("end_time IS NOT NULL").
		Where("user_id IS NOT NULL").
		Select("COALESCE(SUM(duration), 0)").
		Scan(&completedSeconds).Error; err != nil {
		return 0, err
	}

	// Add active sessions (calculate duration on-the-fly)
	var activeSessions []models.UserTracking
	if err := r.db.Where("end_time IS NULL AND user_id IS NOT NULL").Find(&activeSessions).Error; err != nil {
		return 0, err
	}

	var activeSeconds int64
	now := time.Now()
	for _, session := range activeSessions {
		activeSeconds += calculateDuration(&session, now)
	}

	totalSeconds := completedSeconds + activeSeconds
	return float64(totalSeconds) / 3600.0, nil
}

// GetUserTotalHours returns total hours spent by a specific user
func (r *UserTrackingRepository) GetUserTotalHours(userID uint) (float64, error) {
	// Sum completed sessions
	var completedSeconds int64
	if err := r.db.Model(&models.UserTracking{}).
		Where("user_id = ? AND end_time IS NOT NULL", userID).
		Select("COALESCE(SUM(duration), 0)").
		Scan(&completedSeconds).Error; err != nil {
		return 0, err
	}

	// Add active sessions (calculate duration on-the-fly)
	var activeSessions []models.UserTracking
	if err := r.db.Where("user_id = ? AND end_time IS NULL", userID).Find(&activeSessions).Error; err != nil {
		return 0, err
	}

	var activeSeconds int64
	now := time.Now()
	for _, session := range activeSessions {
		activeSeconds += calculateDuration(&session, now)
	}

	totalSeconds := completedSeconds + activeSeconds
	return float64(totalSeconds) / 3600.0, nil
}

// GetAllTrackingRecords returns all tracking records with optional user filter
func (r *UserTrackingRepository) GetAllTrackingRecords(userID *uint) ([]models.UserTracking, error) {
	var records []models.UserTracking
	query := r.db.Order("start_time DESC")

	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	}

	if err := query.Find(&records).Error; err != nil {
		return nil, err
	}
	return records, nil
}

// GetActiveSession returns the active tracking session for a session ID
func (r *UserTrackingRepository) GetActiveSession(sessionID string) (*models.UserTracking, error) {
	var tracking models.UserTracking
	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).
		Order("start_time DESC").
		First(&tracking).Error; err != nil {
		return nil, err
	}
	return &tracking, nil
}

// UpdateActiveSession updates the duration of an active session
func (r *UserTrackingRepository) UpdateActiveSession(sessionID string, userID *uint) error {
	// Do not track guests
	if userID == nil {
		return nil
	}

	var tracking models.UserTracking
	if err := r.db.Where("session_id = ? AND end_time IS NULL AND user_id = ?", sessionID, *userID).
		Order("start_time DESC").
		First(&tracking).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}

	duration := calculateDuration(&tracking, time.Now())
	updates := map[string]interface{}{
		"duration": duration,
	}

	// Update user_id if provided and not already set
	if userID != nil && tracking.UserID == nil {
		updates["user_id"] = userID
	}

	return r.db.Model(&tracking).Updates(updates).Error
}

func calculateDuration(tracking *models.UserTracking, now time.Time) int64 {
	duration := tracking.Duration
	lastUpdate := tracking.UpdatedAt
	if lastUpdate.IsZero() {
		lastUpdate = tracking.StartTime
	}

	// Only extend the session if it was recently updated; otherwise, keep the last recorded duration
	if !lastUpdate.IsZero() && now.After(lastUpdate) && now.Sub(lastUpdate) <= inactiveSessionGracePeriod {
		duration += int64(now.Sub(lastUpdate).Seconds())
	}

	return duration
}

// finalizeActiveSessionsForUser ends all active sessions for the given user ID.
// This ensures only one active session exists per user at any time.
func (r *UserTrackingRepository) finalizeActiveSessionsForUser(userID *uint) error {
	if userID == nil {
		return nil
	}

	var activeSessions []models.UserTracking
	if err := r.db.Where("user_id = ? AND end_time IS NULL", *userID).Find(&activeSessions).Error; err != nil {
		return err
	}

	now := time.Now()
	for _, session := range activeSessions {
		duration := calculateDuration(&session, now)
		updates := map[string]interface{}{
			"duration": duration,
			"end_time": now,
		}
		if err := r.db.Model(&session).Updates(updates).Error; err != nil {
			return err
		}
	}

	return nil
}

// finalizeActiveSessions ends any active sessions for the given session ID.
// This prevents multiple overlapping sessions from persisting indefinitely.
func (r *UserTrackingRepository) finalizeActiveSessions(sessionID string) error {
	var activeSessions []models.UserTracking
	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).Find(&activeSessions).Error; err != nil {
		return err
	}

	now := time.Now()
	for _, session := range activeSessions {
		duration := calculateDuration(&session, now)
		updates := map[string]interface{}{
			"duration": duration,
			"end_time": now,
		}
		if err := r.db.Model(&session).Updates(updates).Error; err != nil {
			return err
		}
	}

	return nil
}
