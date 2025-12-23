package repositories

import (
	"anonchihaya.co.uk/models"
	"gorm.io/gorm"
)

type ProfileRepository interface {
	GetByID(id int) (*models.Profile, error)
	Create(profile *models.Profile) error
	Update(profile *models.Profile) (*models.Profile, error)
	Delete(id int) error
	Counts() (int, error)
}

// * Profile Repository Implementation (GORM/MySql)
type profileRepository struct {
	db *gorm.DB
}

func NewProfileRepository() ProfileRepository {
	return &profileRepository{db: DB}
}

func (r *profileRepository) GetByID(id int) (*models.Profile, error) {
	var profile models.Profile
	if err := r.db.First(&profile, id).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *profileRepository) Create(profile *models.Profile) error {
	if err := r.db.Create(profile).Error; err != nil {
		return err
	}
	return nil
}

func (r *profileRepository) Update(profile *models.Profile) (*models.Profile, error) {
	if err := r.db.Save(profile).Error; err != nil {
		return nil, err
	}
	return profile, nil
}

func (r *profileRepository) Delete(id int) error {
	if err := r.db.Delete(&models.Profile{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *profileRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&models.Profile{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
