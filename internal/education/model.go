package education

// Education captures formal education milestones.
// Dates are nullable: an empty value must be stored as NULL, never '' (MySQL
// rejects '' for DATE columns in strict mode).
type Education struct {
	ID           int      `gorm:"primaryKey" json:"id"`
	School       string   `json:"school"`
	Degree       string   `json:"degree"`
	StartDate    *string  `gorm:"type:date" json:"start_date"`
	EndDate      *string  `gorm:"type:date" json:"end_date"`
	Link         string   `json:"link"`
	ImageURL     string   `json:"image_url"`
	BulletPoints []string `gorm:"type:json;serializer:json" json:"bullet_points"`
}
