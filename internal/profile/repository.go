package profile

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type ProfileRepository interface {
	GetByID(id int) (*Profile, error)
	Create(profile *Profile) error
	Update(profile *Profile) (*Profile, error)
	Delete(id int) error
	Counts() (int, error)
}

// * Profile Repository Implementation (GORM/MySql)
type profileRepository struct {
	db *gorm.DB
}

func NewProfileRepository() ProfileRepository {
	return &profileRepository{db: store.DB}
}

func (r *profileRepository) GetByID(id int) (*Profile, error) {
	var profile Profile
	if err := r.db.First(&profile, id).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *profileRepository) Create(profile *Profile) error {
	if err := r.db.Create(profile).Error; err != nil {
		return err
	}
	return nil
}

func (r *profileRepository) Update(profile *Profile) (*Profile, error) {
	if err := r.db.Save(profile).Error; err != nil {
		return nil, err
	}
	return profile, nil
}

func (r *profileRepository) Delete(id int) error {
	if err := r.db.Delete(&Profile{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *profileRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&Profile{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
