package post

import "time"

type Post struct {
	ID         int    `gorm:"primaryKey" json:"id"`
	ParentID   int    `json:"parent_id"`
	ParentType string `json:"parent_type"`
	Name       string `json:"name"`
	// ContentMD holds the body in whichever format Format names: markdown as
	// written, or a raw HTML document uploaded by an admin (rendered without
	// sanitisation — see the format checks in handler.go). The MD suffix
	// predates HTML support — the column name is load-bearing, don't rename.
	ContentMD  string    `json:"content_md"`
	Format     string    `gorm:"type:varchar(16);not null;default:'markdown'" json:"format"`
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
