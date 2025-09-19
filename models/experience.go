package models

type Experience struct {
	ID          int    `json:"id"`
	Company     string `json:"company"`
	Position    string `json:"position"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	Present     bool   `json:"present"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
	OrderIndex  string `json:"order_index"`
}

type ExperienceShort struct {
	ID         int    `json:"id"`
	Company    string `json:"company"`
	Position   string `json:"position"`
	StartDate  string `json:"start_date"`
	EndDate    string `json:"end_date"`
	Present    bool   `json:"present"`
	ImageURL   string `json:"image_url"`
	OrderIndex string `json:"order_index"`
}
