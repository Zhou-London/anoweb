package post

import "time"

type Post struct {
	ID         int       `gorm:"primaryKey" json:"id"`
	ParentID   int       `json:"parent_id"`
	ParentType string    `json:"parent_type"`
	Name       string    `json:"name"`
	ContentMD  string    `json:"content_md"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type PostShort struct {
	ID         int       `json:"id"`
	ParentID   int       `json:"parent_id"`
	ParentType string    `json:"parent_type"`
	Name       string    `json:"name"`
	UpdatedAt  time.Time `json:"updated_at"`
}
