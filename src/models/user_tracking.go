package models

import (
	"time"
)

// UserTracking tracks time spent by users on the website
type UserTracking struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    *uint     `gorm:"index" json:"user_id"` // Nullable for guest users
	SessionID string    `gorm:"type:varchar(255);index;not null" json:"session_id"`
	StartTime time.Time `gorm:"not null" json:"start_time"`
	EndTime   *time.Time `json:"end_time"` // Nullable for active sessions
	Duration  int64     `gorm:"default:0" json:"duration"` // Duration in seconds
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
