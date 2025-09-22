package models

type Project struct {
	ID          int    `json:"id"` // Auto
	Name        string `json:"name"`
	Description string `json:"description"`
	Link        string `json:"link"`
	ImageURL    string `json:"image_url"`

	CreatedAt string `json:"created_at"` // Auto
	UpdatedAt string `json:"updated_at"` // Auto
}
