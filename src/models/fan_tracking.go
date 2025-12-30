package models

import (
	"time"
)

// FanTracking tracks time spent by fans on the website
type FanTracking struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	FanID     *uint      `gorm:"column:user_id;index" json:"user_id"` // Nullable for guest fans, keeping column name as user_id
	SessionID string     `gorm:"type:varchar(255);index;not null" json:"session_id"`
	StartTime time.Time  `gorm:"not null" json:"start_time"`
	EndTime   *time.Time `json:"end_time"`                  // Nullable for active sessions
	Duration  int64      `gorm:"default:0" json:"duration"` // Duration in seconds
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// TableName overrides the table name to keep using the existing "user_trackings" table
func (FanTracking) TableName() string {
	return "user_trackings"
}
