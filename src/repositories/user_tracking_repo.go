package repositories

import (
	"time"

	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

type UserTrackingRepository struct {
	db *gorm.DB
}

func NewUserTrackingRepository(db *gorm.DB) *UserTrackingRepository {
	return &UserTrackingRepository{db: db}
}

// StartTracking creates a new tracking session
func (r *UserTrackingRepository) StartTracking(userID *uint, sessionID string) (*models.UserTracking, error) {
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
// Also updates user_id if the user is now authenticated
func (r *UserTrackingRepository) EndTracking(sessionID string, userID *uint) error {
	now := time.Now()
	var tracking models.UserTracking

	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).First(&tracking).Error; err != nil {
		return err
	}

	duration := int64(now.Sub(tracking.StartTime).Seconds())
	updates := map[string]interface{}{
		"end_time": now,
		"duration": duration,
	}

	// Update user_id if provided and not already set
	if userID != nil && tracking.UserID == nil {
		updates["user_id"] = userID
	}

	return r.db.Model(&tracking).Updates(updates).Error
}

// GetTotalHours returns total hours spent by all users
func (r *UserTrackingRepository) GetTotalHours() (float64, error) {
	// Sum completed sessions
	var completedSeconds int64
	if err := r.db.Model(&models.UserTracking{}).
		Where("end_time IS NOT NULL").
		Select("COALESCE(SUM(duration), 0)").
		Scan(&completedSeconds).Error; err != nil {
		return 0, err
	}

	// Add active sessions (calculate duration on-the-fly)
	var activeSessions []models.UserTracking
	if err := r.db.Where("end_time IS NULL").Find(&activeSessions).Error; err != nil {
		return 0, err
	}

	var activeSeconds int64
	for _, session := range activeSessions {
		activeSeconds += int64(time.Now().Sub(session.StartTime).Seconds())
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
	for _, session := range activeSessions {
		activeSeconds += int64(time.Now().Sub(session.StartTime).Seconds())
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
	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).First(&tracking).Error; err != nil {
		return nil, err
	}
	return &tracking, nil
}

// UpdateActiveSession updates the duration of an active session
// Also updates user_id if the user is now authenticated
func (r *UserTrackingRepository) UpdateActiveSession(sessionID string, userID *uint) error {
	var tracking models.UserTracking
	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).First(&tracking).Error; err != nil {
		return err
	}

	duration := int64(time.Now().Sub(tracking.StartTime).Seconds())
	updates := map[string]interface{}{
		"duration": duration,
	}

	// Update user_id if provided and not already set
	if userID != nil && tracking.UserID == nil {
		updates["user_id"] = userID
	}

	return r.db.Model(&tracking).Updates(updates).Error
}
