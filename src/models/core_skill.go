package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// StringSlice is a custom type for storing string arrays in the database
type StringSlice []string

// Scan implements the sql.Scanner interface for StringSlice
func (s *StringSlice) Scan(value interface{}) error {
	if value == nil {
		*s = []string{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, s)
}

// Value implements the driver.Valuer interface for StringSlice
func (s StringSlice) Value() (driver.Value, error) {
	if len(s) == 0 {
		return "[]", nil
	}
	return json.Marshal(s)
}

// CoreSkill represents a core skill entry for the homepage.
type CoreSkill struct {
	ID           int         `gorm:"primaryKey" json:"id"`
	Name         string      `json:"name"`
	BulletPoints StringSlice `gorm:"type:json" json:"bullet_points"`
	OrderIndex   int         `json:"order_index"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
