package tracking

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

const inactiveSessionGracePeriod = 2 * time.Minute

type FanTrackingRepository struct {
	db *gorm.DB
}

func NewFanTrackingRepository(db *gorm.DB) *FanTrackingRepository {
	return &FanTrackingRepository{db: db}
}

// StartTracking creates a new tracking session
func (r *FanTrackingRepository) StartTracking(fanID *uint, sessionID string) (*FanTracking, error) {
	// Do not track guests
	if fanID == nil {
		return nil, nil
	}

	// End any lingering active sessions for this fan before starting a new one
	// This ensures only one active session exists per fan at any time
	if err := r.finalizeActiveSessionsForFan(fanID); err != nil {
		return nil, err
	}

	tracking := &FanTracking{
		FanID:     fanID,
		SessionID: sessionID,
		StartTime: time.Now(),
	}
	if err := r.db.Create(tracking).Error; err != nil {
		return nil, err
	}
	return tracking, nil
}

// EndTracking updates the tracking session with end time and duration
func (r *FanTrackingRepository) EndTracking(sessionID string, fanID *uint) error {
	now := time.Now()
	var tracking FanTracking

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
	if fanID != nil && tracking.FanID == nil {
		updates["user_id"] = fanID
	}

	if err := r.db.Model(&tracking).Updates(updates).Error; err != nil {
		return err
	}

	// Clean up any other active sessions tied to the same session ID
	return r.finalizeActiveSessions(sessionID)
}

// GetTotalHours returns total hours spent by all fans
func (r *FanTrackingRepository) GetTotalHours() (float64, error) {
	// Sum completed sessions
	var completedSeconds int64
	if err := r.db.Model(&FanTracking{}).
		Where("end_time IS NOT NULL").
		Where("user_id IS NOT NULL").
		Select("COALESCE(SUM(duration), 0)").
		Scan(&completedSeconds).Error; err != nil {
		return 0, err
	}

	// Add active sessions (calculate duration on-the-fly)
	var activeSessions []FanTracking
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

// GetFanTotalHours returns total hours spent by a specific fan
func (r *FanTrackingRepository) GetFanTotalHours(fanID uint) (float64, error) {
	// Sum completed sessions
	var completedSeconds int64
	if err := r.db.Model(&FanTracking{}).
		Where("user_id = ? AND end_time IS NOT NULL", fanID).
		Select("COALESCE(SUM(duration), 0)").
		Scan(&completedSeconds).Error; err != nil {
		return 0, err
	}

	// Add active sessions (calculate duration on-the-fly)
	var activeSessions []FanTracking
	if err := r.db.Where("user_id = ? AND end_time IS NULL", fanID).Find(&activeSessions).Error; err != nil {
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

// GetAllTrackingRecords returns all tracking records with optional fan filter
func (r *FanTrackingRepository) GetAllTrackingRecords(fanID *uint) ([]FanTracking, error) {
	var records []FanTracking
	query := r.db.Order("start_time DESC")

	if fanID != nil {
		query = query.Where("user_id = ?", *fanID)
	}

	if err := query.Find(&records).Error; err != nil {
		return nil, err
	}
	return records, nil
}

// GetActiveSession returns the active tracking session for a session ID
func (r *FanTrackingRepository) GetActiveSession(sessionID string) (*FanTracking, error) {
	var tracking FanTracking
	if err := r.db.Where("session_id = ? AND end_time IS NULL", sessionID).
		Order("start_time DESC").
		First(&tracking).Error; err != nil {
		return nil, err
	}
	return &tracking, nil
}

// UpdateActiveSession updates the duration of an active session
func (r *FanTrackingRepository) UpdateActiveSession(sessionID string, fanID *uint) error {
	// Do not track guests
	if fanID == nil {
		return nil
	}

	var tracking FanTracking
	if err := r.db.Where("session_id = ? AND end_time IS NULL AND user_id = ?", sessionID, *fanID).
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
	if fanID != nil && tracking.FanID == nil {
		updates["user_id"] = fanID
	}

	return r.db.Model(&tracking).Updates(updates).Error
}

func calculateDuration(tracking *FanTracking, now time.Time) int64 {
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

// finalizeActiveSessionsForFan ends all active sessions for the given fan ID.
// This ensures only one active session exists per fan at any time.
func (r *FanTrackingRepository) finalizeActiveSessionsForFan(fanID *uint) error {
	if fanID == nil {
		return nil
	}

	var activeSessions []FanTracking
	if err := r.db.Where("user_id = ? AND end_time IS NULL", *fanID).Find(&activeSessions).Error; err != nil {
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
func (r *FanTrackingRepository) finalizeActiveSessions(sessionID string) error {
	var activeSessions []FanTracking
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
