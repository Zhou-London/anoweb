package models

import "time"

type Learning struct {
	ID          int       `json:"id"`
	Topic       string    `json:"topic"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
