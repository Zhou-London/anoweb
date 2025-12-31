package auth

import (
	"time"

	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type SessionRepository struct {
	db *gorm.DB
}

func NewSessionRepository() *SessionRepository {
	return &SessionRepository{db: store.DB}
}

func (r *SessionRepository) Create(session *Session) error {
	return r.db.Create(session).Error
}

func (r *SessionRepository) FindByToken(token string) (*Session, error) {
	var session Session
	err := r.db.Preload("Fan").Where("token = ? AND expires_at > ?", token, time.Now()).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SessionRepository) DeleteByToken(token string) error {
	return r.db.Where("token = ?", token).Delete(&Session{}).Error
}

func (r *SessionRepository) DeleteByUserID(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&Session{}).Error
}

func (r *SessionRepository) DeleteExpired() error {
	return r.db.Where("expires_at < ?", time.Now()).Delete(&Session{}).Error
}
