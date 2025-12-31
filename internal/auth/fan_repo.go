package auth

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type FanRepository struct {
	db *gorm.DB
}

func NewFanRepository() *FanRepository {
	return &FanRepository{db: store.DB}
}

func (r *FanRepository) Create(fan *Fan) error {
	return r.db.Create(fan).Error
}

func (r *FanRepository) FindByID(id uint) (*Fan, error) {
	var fan Fan
	err := r.db.First(&fan, id).Error
	if err != nil {
		return nil, err
	}
	return &fan, nil
}

func (r *FanRepository) FindByUsername(username string) (*Fan, error) {
	var fan Fan
	err := r.db.Where("username = ?", username).First(&fan).Error
	if err != nil {
		return nil, err
	}
	return &fan, nil
}

func (r *FanRepository) FindByEmail(email string) (*Fan, error) {
	var fan Fan
	err := r.db.Where("email = ?", email).First(&fan).Error
	if err != nil {
		return nil, err
	}
	return &fan, nil
}

func (r *FanRepository) Update(fan *Fan) error {
	return r.db.Save(fan).Error
}

func (r *FanRepository) Delete(id uint) error {
	return r.db.Delete(&Fan{}, id).Error
}

func (r *FanRepository) SetAdmin(fanID uint, isAdmin bool) error {
	return r.db.Model(&Fan{}).Where("id = ?", fanID).Update("is_admin", isAdmin).Error
}

func (r *FanRepository) FindByVerificationToken(token string) (*Fan, error) {
	var fan Fan
	err := r.db.Where("verification_token = ?", token).First(&fan).Error
	if err != nil {
		return nil, err
	}
	return &fan, nil
}

func (r *FanRepository) FindByOAuthID(provider, oauthID string) (*Fan, error) {
	var fan Fan
	err := r.db.Where("o_auth_provider = ? AND o_auth_id = ?", provider, oauthID).First(&fan).Error
	if err != nil {
		return nil, err
	}
	return &fan, nil
}

func (r *FanRepository) MarkExistingFansAsVerified() error {
	return r.db.Model(&Fan{}).Where("email_verified = ?", false).Where("o_auth_provider = ? OR o_auth_provider IS NULL", "").Update("email_verified", true).Error
}

func (r *FanRepository) GetAll() ([]*Fan, error) {
	var fans []*Fan
	err := r.db.Order("created_at DESC").Find(&fans).Error
	if err != nil {
		return nil, err
	}
	return fans, nil
}
