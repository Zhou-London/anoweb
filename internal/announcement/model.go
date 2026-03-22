package announcement

import "time"

type Announcement struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	ContentMD string    `gorm:"type:text;not null" json:"content_md"`
	ImageURL  string    `gorm:"type:varchar(500)" json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
