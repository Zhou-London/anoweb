package experience

// Experience captures work history entries.
type Experience struct {
	ID           int      `gorm:"primaryKey" json:"id"`
	Company      string   `json:"company"`
	Position     string   `json:"position"`
	StartDate    string   `gorm:"type:date" json:"start_date"`
	EndDate      string   `gorm:"type:date" json:"end_date"`
	Present      bool     `json:"present"`
	Description  string   `json:"description"`
	ImageURL     string   `json:"image_url"`
	OrderIndex   int      `json:"order_index"`
	BulletPoints []string `gorm:"type:json;serializer:json" json:"bullet_points"`
}

type ExperienceShort struct {
	ID           int      `json:"id"`
	Company      string   `json:"company"`
	Position     string   `json:"position"`
	StartDate    string   `json:"start_date"`
	EndDate      string   `json:"end_date"`
	Present      bool     `json:"present"`
	ImageURL     string   `json:"image_url"`
	OrderIndex   int      `json:"order_index"`
	Description  string   `json:"description"`
	BulletPoints []string `gorm:"type:json;serializer:json" json:"bullet_points"`
}
