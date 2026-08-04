package comment

import "time"

const MaxContentLength = 2000

// Comment is a plain-text comment on a forum post. ParentID points at
// another comment on the same post for threaded replies.
type Comment struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PostID     int       `gorm:"index;not null" json:"post_id"`
	ParentID   *uint     `gorm:"index" json:"parent_id"`
	AuthorID   uint      `gorm:"index;not null" json:"author_id"`
	AuthorName string    `gorm:"type:varchar(255)" json:"author_name"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	LikesCount int64     `gorm:"default:0" json:"likes_count"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CommentLike struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CommentID uint      `gorm:"uniqueIndex:idx_comment_fan;not null" json:"comment_id"`
	FanID     uint      `gorm:"uniqueIndex:idx_comment_fan;not null" json:"fan_id"`
	CreatedAt time.Time `json:"created_at"`
}

// CommentWithMeta decorates a comment with the author's current photo and
// the requesting fan's like status.
type CommentWithMeta struct {
	Comment     `gorm:"embedded"`
	AuthorPhoto string `json:"author_photo"`
	HasLiked    bool   `gorm:"-" json:"has_liked"`
}
