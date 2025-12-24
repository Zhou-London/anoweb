package models

import (
	"time"
)

// MysteryCode stores codes that can grant admin privileges
type MysteryCode struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Code      string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"code"`
	IsUsed    bool      `gorm:"default:false" json:"is_used"`
	UsedBy    *uint     `gorm:"index" json:"used_by"` // UserID who used this code
	UsedAt    *time.Time `json:"used_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
