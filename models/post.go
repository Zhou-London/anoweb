package models

type Post struct {
	ID         int    `json:"id"`
	ParentID   int    `json:"parent_id"`
	ParentType string `json:"parent_type"`
	Name       string `json:"name"`
	ContentMD  string `json:"content_md"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type PostShort struct {
	ID         int    `json:"id"`
	ParentID   int    `json:"parent_id"`
	ParentType string `json:"parent_type"`
	Name       string `json:"name"`
	UpdatedAt  string `json:"updated_at"`
}
