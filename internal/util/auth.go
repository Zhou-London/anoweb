package util

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword generates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with its hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateSessionToken creates a new unique session token
func GenerateSessionToken() string {
	return uuid.New().String()
}

// GetSessionExpiry returns the expiration time for a session (7 days from now)
func GetSessionExpiry() time.Time {
	return time.Now().Add(7 * 24 * time.Hour)
}
