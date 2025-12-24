package models

import (
	"time"
)

// GuestPopupConfig stores configurable benefits shown in the guest registration popup
type GuestPopupConfig struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	Benefits  string    `gorm:"type:text;not null" json:"benefits"` // JSON array of benefit strings
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
