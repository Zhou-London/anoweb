package models

import (
	"time"
)

type Session struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	FanID     uint      `gorm:"column:user_id;not null;index" json:"user_id"` // Keeping column name as user_id
	Token     string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	Fan       Fan       `gorm:"foreignKey:FanID;references:ID" json:"-"`
}
