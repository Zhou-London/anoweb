package models

type Education struct {
	ID        int    `json:"id"`
	School    string `json:"school"`
	Degree    string `json:"degree"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	Link      string `json:"link"`
	ImageURL  string `json:"image_url"`
}
