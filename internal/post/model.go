package post

import "time"

type Post struct {
	ID         int       `gorm:"primaryKey" json:"id"`
	ParentID   int       `json:"parent_id"`
	ParentType string    `json:"parent_type"`
	Name       string    `json:"name"`
	ContentMD  string    `json:"content_md"`
	AuthorID   *uint     `gorm:"index" json:"author_id"`
	AuthorName string    `gorm:"type:varchar(255)" json:"author_name"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type PostShort struct {
	ID          int       `json:"id"`
	ParentID    int       `json:"parent_id"`
	ParentType  string    `json:"parent_type"`
	Name        string    `json:"name"`
	AuthorName  string    `json:"author_name"`
	AuthorPhoto string    `json:"author_photo"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// PostWithAuthor decorates a post with the author's current profile photo
// (joined from users at read time; empty for authorless legacy posts).
type PostWithAuthor struct {
	Post        `gorm:"embedded"`
	AuthorPhoto string `json:"author_photo"`
}
