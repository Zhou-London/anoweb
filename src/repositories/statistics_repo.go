package repositories

import (
	"time"

	"gorm.io/gorm"
)

type StatisticsRepository struct {
	db *gorm.DB
}

func NewStatisticsRepository(db *gorm.DB) *StatisticsRepository {
	return &StatisticsRepository{db: db}
}

// GetTotalFans returns the total number of registered fans
func (r *StatisticsRepository) GetTotalFans() (int64, error) {
	var count int64
	err := r.db.Table("users").Count(&count).Error
	return count, err
}

// GetUniqueVisitors returns the count of unique visitors (registered fans + guests)
func (r *StatisticsRepository) GetUniqueVisitors() (int64, error) {
	var count int64
	// Count distinct session_ids from user_trackings
	err := r.db.Table("user_trackings").
		Distinct("session_id").
		Count(&count).Error
	return count, err
}

// GetUniqueVisitorsLast24Hours returns unique visitors in the last 24 hours
func (r *StatisticsRepository) GetUniqueVisitorsLast24Hours() (int64, error) {
	var count int64
	since := time.Now().Add(-24 * time.Hour)
	err := r.db.Table("user_trackings").
		Where("start_time >= ?", since).
		Distinct("session_id").
		Count(&count).Error
	return count, err
}

// GetRegisteredVisitorsEver returns count of registered fans who have visited
func (r *StatisticsRepository) GetRegisteredVisitorsEver() (int64, error) {
	var count int64
	err := r.db.Table("user_trackings").
		Where("user_id IS NOT NULL").
		Distinct("user_id").
		Count(&count).Error
	return count, err
}

// GetGuestVisitorsEver returns count of guest sessions
func (r *StatisticsRepository) GetGuestVisitorsEver() (int64, error) {
	var count int64
	err := r.db.Table("user_trackings").
		Where("user_id IS NULL").
		Distinct("session_id").
		Count(&count).Error
	return count, err
}

// GetRegisteredVisitorsLast24Hours returns registered fans who visited in last 24h
func (r *StatisticsRepository) GetRegisteredVisitorsLast24Hours() (int64, error) {
	var count int64
	since := time.Now().Add(-24 * time.Hour)
	err := r.db.Table("user_trackings").
		Where("user_id IS NOT NULL").
		Where("start_time >= ?", since).
		Distinct("user_id").
		Count(&count).Error
	return count, err
}

// GetGuestVisitorsLast24Hours returns guest sessions in last 24h
func (r *StatisticsRepository) GetGuestVisitorsLast24Hours() (int64, error) {
	var count int64
	since := time.Now().Add(-24 * time.Hour)
	err := r.db.Table("user_trackings").
		Where("user_id IS NULL").
		Where("start_time >= ?", since).
		Distinct("session_id").
		Count(&count).Error
	return count, err
}

// GetActiveUsersToday returns visitors who have visited today (fans + guests)
func (r *StatisticsRepository) GetActiveUsersToday() (int64, error) {
	var count int64
	today := time.Now().Truncate(24 * time.Hour)
	err := r.db.Table("user_trackings").
		Where("start_time >= ?", today).
		Distinct("session_id").
		Count(&count).Error
	return count, err
}

// GetFanStreak returns the current streak (consecutive days) for a fan
func (r *StatisticsRepository) GetFanStreak(fanID uint) (int, error) {
	var dates []time.Time

	// Get all distinct dates the fan has visited, ordered by date descending
	err := r.db.Table("user_trackings").
		Select("DATE(start_time) as date").
		Where("user_id = ?", fanID).
		Group("DATE(start_time)").
		Order("date DESC").
		Scan(&dates).Error

	if err != nil {
		return 0, err
	}

	if len(dates) == 0 {
		return 0, nil
	}

	// Calculate streak
	streak := 0
	today := time.Now().Truncate(24 * time.Hour)
	expectedDate := today

	// Check if fan visited today or yesterday (streak can continue)
	firstDate := dates[0].Truncate(24 * time.Hour)
	if firstDate.Equal(today) {
		expectedDate = today
	} else if firstDate.Equal(today.Add(-24 * time.Hour)) {
		expectedDate = today.Add(-24 * time.Hour)
	} else {
		// Streak is broken
		return 0, nil
	}

	// Count consecutive days
	for _, date := range dates {
		dateOnly := date.Truncate(24 * time.Hour)
		if dateOnly.Equal(expectedDate) {
			streak++
			expectedDate = expectedDate.Add(-24 * time.Hour)
		} else {
			break
		}
	}

	return streak, nil
}

// FansOverTimePoint represents a data point for visitors over time
type FansOverTimePoint struct {
	Hour  string `json:"hour"`
	Count int64  `json:"count"`
}

// GetFansOverTime returns hourly visitor counts for the last N hours
func (r *StatisticsRepository) GetFansOverTime(hours int) ([]FansOverTimePoint, error) {
	var results []FansOverTimePoint
	
	since := time.Now().Add(-time.Duration(hours) * time.Hour)
	
	// Detect database type
	dbName := r.db.Dialector.Name()
	var query string
	
	if dbName == "sqlite" {
		query = `
			SELECT 
				strftime('%Y-%m-%d %H:00:00', start_time) as hour,
				COUNT(DISTINCT session_id) as count
			FROM user_trackings
			WHERE start_time >= ?
			GROUP BY strftime('%Y-%m-%d %H:00:00', start_time)
			ORDER BY hour ASC
		`
	} else {
		// MySQL/MariaDB
		query = `
			SELECT 
				DATE_FORMAT(start_time, '%Y-%m-%d %H:00:00') as hour,
				COUNT(DISTINCT session_id) as count
			FROM user_trackings
			WHERE start_time >= ?
			GROUP BY DATE_FORMAT(start_time, '%Y-%m-%d %H:00:00')
			ORDER BY hour ASC
		`
	}
	
	err := r.db.Raw(query, since).Scan(&results).Error
	return results, err
}

// DailyActiveUsersPoint represents daily active users
type DailyActiveUsersPoint struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

// GetDailyActiveUsers returns daily active user counts for the last N days
func (r *StatisticsRepository) GetDailyActiveUsers(days int) ([]DailyActiveUsersPoint, error) {
	var results []DailyActiveUsersPoint
	
	since := time.Now().Add(-time.Duration(days) * 24 * time.Hour)
	
	// Detect database type
	dbName := r.db.Dialector.Name()
	var query string
	
	if dbName == "sqlite" {
		query = `
			SELECT 
				date(start_time) as date,
				COUNT(DISTINCT session_id) as count
			FROM user_trackings
			WHERE start_time >= ?
			GROUP BY date(start_time)
			ORDER BY date ASC
		`
	} else {
		// MySQL/MariaDB - DATE() works the same
		query = `
			SELECT 
				DATE(start_time) as date,
				COUNT(DISTINCT session_id) as count
			FROM user_trackings
			WHERE start_time >= ?
			GROUP BY DATE(start_time)
			ORDER BY date ASC
		`
	}
	
	err := r.db.Raw(query, since).Scan(&results).Error
	return results, err
}
