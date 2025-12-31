package learning

import "time"

// Learning represents study notes or topics currently being learned.
type Learning struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	Topic       string    `json:"topic"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
