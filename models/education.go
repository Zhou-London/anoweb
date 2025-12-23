package models

// Education captures formal education milestones.
type Education struct {
	ID        int    `gorm:"primaryKey" json:"id"`
	School    string `json:"school"`
	Degree    string `json:"degree"`
	StartDate string `gorm:"type:date" json:"start_date"`
	EndDate   string `gorm:"type:date" json:"end_date"`
	Link      string `json:"link"`
	ImageURL  string `json:"image_url"`
}
