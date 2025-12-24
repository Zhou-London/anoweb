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
func (r *UserTrackingRepository) EndTracking(sessionID string) error {
	now := time.Now()
	var tracking models.UserTracking
	
	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).First(&tracking).Error; err != nil {
		return err
	}
	
	duration := int64(now.Sub(tracking.StartTime).Seconds())
	return r.db.Model(&tracking).Updates(map[string]interface{}{
		"end_time": now,
		"duration": duration,
	}).Error
}

// GetTotalHours returns total hours spent by all users
func (r *UserTrackingRepository) GetTotalHours() (float64, error) {
	var totalSeconds int64
	if err := r.db.Model(&models.UserTracking{}).Select("COALESCE(SUM(duration), 0)").Scan(&totalSeconds).Error; err != nil {
		return 0, err
	}
	return float64(totalSeconds) / 3600.0, nil
}

// GetUserTotalHours returns total hours spent by a specific user
func (r *UserTrackingRepository) GetUserTotalHours(userID uint) (float64, error) {
	var totalSeconds int64
	if err := r.db.Model(&models.UserTracking{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(duration), 0)").
		Scan(&totalSeconds).Error; err != nil {
		return 0, err
	}
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
func (r *UserTrackingRepository) UpdateActiveSession(sessionID string) error {
	var tracking models.UserTracking
	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).First(&tracking).Error; err != nil {
		return err
	}
	
	duration := int64(time.Now().Sub(tracking.StartTime).Seconds())
	return r.db.Model(&tracking).Update("duration", duration).Error
}
