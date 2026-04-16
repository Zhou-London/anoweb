package vbook

import "time"

// VBook represents a virtual book with admin-editable metadata.
// The chapter content itself is rendered by the frontend; the backend only
// stores the vBook descriptor and per-fan progress.
type VBook struct {
	ID            int       `gorm:"primaryKey" json:"id"`
	Slug          string    `gorm:"type:varchar(64);uniqueIndex" json:"slug"`
	Title         string    `gorm:"type:varchar(255)" json:"title"`
	Description   string    `gorm:"type:text" json:"description"`
	CoverImageURL string    `gorm:"type:varchar(500)" json:"cover_image_url"`
	OrderIndex    int       `gorm:"default:0" json:"order_index"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// VBookProgress records that a fan finished a particular section inside a chapter.
// Combined index ensures one row per (fan, vbook, chapter, section).
type VBookProgress struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	FanID     uint      `gorm:"uniqueIndex:idx_vbook_progress;not null" json:"fan_id"`
	VBookID   int       `gorm:"uniqueIndex:idx_vbook_progress;not null" json:"vbook_id"`
	ChapterID string    `gorm:"uniqueIndex:idx_vbook_progress;type:varchar(64);not null" json:"chapter_id"`
	SectionID string    `gorm:"uniqueIndex:idx_vbook_progress;type:varchar(64);not null" json:"section_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// VBookLastRead remembers the most recent chapter+section a fan was reading.
// One row per (fan, vbook); upserted on every section navigation.
type VBookLastRead struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	FanID     uint      `gorm:"uniqueIndex:idx_vbook_last_read;not null" json:"fan_id"`
	VBookID   int       `gorm:"uniqueIndex:idx_vbook_last_read;not null" json:"vbook_id"`
	ChapterID string    `gorm:"type:varchar(64);not null" json:"chapter_id"`
	SectionID string    `gorm:"type:varchar(64);not null" json:"section_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// VBookShort is the compact list payload shown on the vBooks index page.
type VBookShort struct {
	ID            int       `json:"id"`
	Slug          string    `json:"slug"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	CoverImageURL string    `json:"cover_image_url"`
	OrderIndex    int       `json:"order_index"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ChapterProgress aggregates how many sections inside one chapter the fan has finished.
type ChapterProgress struct {
	ChapterID        string     `json:"chapter_id"`
	CompletedCount   int        `json:"completed_count"`
	CompletedSection []string   `json:"completed_sections"`
	LastCompletedAt  *time.Time `json:"last_completed_at,omitempty"`
}

// LastReadInfo is the JSON-friendly representation of VBookLastRead.
type LastReadInfo struct {
	ChapterID string    `json:"chapter_id"`
	SectionID string    `json:"section_id"`
	UpdatedAt time.Time `json:"updated_at"`
}

// VBookWithProgress is what GET /api/vbook/:id returns.
// Progress is empty when the request is unauthenticated.
type VBookWithProgress struct {
	VBook
	Progress []ChapterProgress `json:"progress"`
	LastRead *LastReadInfo      `json:"last_read"`
}
