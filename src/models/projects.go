package models

import "time"

// Project represents a portfolio project entry.
type Project struct {
	ID          int    `gorm:"primaryKey" json:"id"` // Auto
	Name        string `json:"name"`
	Description string `json:"description"`
	Link        string `json:"link"`
	ImageURL    string `json:"image_url"`

	CreatedAt time.Time `json:"created_at"` // Auto
	UpdatedAt time.Time `json:"updated_at"` // Auto
}
