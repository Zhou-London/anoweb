package blog

import "time"

type Blog struct {
	ID    int    `gorm:"primaryKey" json:"id"`
	Title string `json:"title"`
	// ContentMD holds the body in whichever format Format names: markdown as
	// written, or a raw HTML document uploaded by an admin (rendered without
	// sanitisation — see the format checks in handler.go). The MD suffix
	// predates HTML support — the column name is load-bearing, don't rename.
	ContentMD  string    `json:"content_md"`
	Format     string    `gorm:"type:varchar(16);not null;default:'markdown'" json:"format"`
	ImageURL   string    `json:"image_url"`
	Views      int64     `gorm:"default:0" json:"views"`
	LikesCount int64     `gorm:"default:0" json:"likes_count"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type BlogShort struct {
	ID         int       `json:"id"`
	Title      string    `json:"title"`
	ImageURL   string    `json:"image_url"`
	Views      int64     `json:"views"`
	LikesCount int64     `json:"likes_count"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type BlogLike struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	BlogID    int       `gorm:"uniqueIndex:idx_blog_fan;not null" json:"blog_id"`
	FanID     uint      `gorm:"uniqueIndex:idx_blog_fan;not null" json:"fan_id"`
	CreatedAt time.Time `json:"created_at"`
}

// BlogWithLikeStatus is used when returning a blog with the user's like status
type BlogWithLikeStatus struct {
	Blog
	HasLiked bool `json:"has_liked"`
}
