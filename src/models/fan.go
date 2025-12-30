package models

import (
	"time"
)

type Fan struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	Username          string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"username"`
	Email             string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash      string    `gorm:"type:varchar(255)" json:"-"`
	IsAdmin           bool      `gorm:"default:false" json:"is_admin"`
	ProfilePhoto      string    `gorm:"type:varchar(500)" json:"profile_photo"`
	Bio               string    `gorm:"type:text" json:"bio"`
	EmailVerified     bool      `gorm:"default:false" json:"email_verified"`
	VerificationToken string    `gorm:"type:varchar(255)" json:"-"`
	OAuthProvider     string    `gorm:"type:varchar(50)" json:"oauth_provider,omitempty"`
	OAuthID           string    `gorm:"type:varchar(255)" json:"-"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// TableName overrides the table name to keep using the existing "users" table
func (Fan) TableName() string {
	return "users"
}
