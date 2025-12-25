package models

// Skill captures professional skills.
type Skill struct {
	ID         int    `gorm:"primaryKey" json:"id"`
	Name       string `json:"name"`
	Category   string `json:"category"`
	OrderIndex int    `json:"order_index"`
}
