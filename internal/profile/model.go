package profile

// Profile represents the site's owner profile information.
type Profile struct {
	ID       int    `gorm:"primaryKey" json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Github   string `json:"github"`
	Linkedin string `json:"linkedin"`
	Bio      string `json:"bio"`
}

// TableName keeps the historical table name used by the application.
func (Profile) TableName() string {
	return "profile_info"
}
