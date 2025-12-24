package repositories

import (
	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

type ExperienceRepository interface {
	GetByID(id int) (*models.Experience, error)
	GetAll() ([]*models.Experience, error)
	GetAllShort() ([]*models.ExperienceShort, error)
	Create(experience *models.Experience) (int, error)
	Update(id int, experience *models.Experience) (*models.Experience, error)
	UpdateOrderIndex(id int, order_index int) (*models.Experience, error)
	Delete(id int) error
	Counts() (int, error)
}

type experienceRepository struct {
	db *gorm.DB
}

func NewExperienceRepository() ExperienceRepository {
	return &experienceRepository{db: DB}
}

func (r *experienceRepository) GetByID(id int) (*models.Experience, error) {
	var experience models.Experience
	if err := r.db.First(&experience, id).Error; err != nil {
		return nil, err
	}
	return &experience, nil
}

func (r *experienceRepository) GetAll() ([]*models.Experience, error) {
	var experiences []*models.Experience
	if err := r.db.Order("order_index ASC").Find(&experiences).Error; err != nil {
		return nil, err
	}
	return experiences, nil
}

func (r *experienceRepository) GetAllShort() ([]*models.ExperienceShort, error) {
	var experiences []*models.ExperienceShort
	if err := r.db.Model(&models.Experience{}).Order("order_index ASC").Find(&experiences).Error; err != nil {
		return nil, err
	}
	return experiences, nil
}

func (r *experienceRepository) Create(experience *models.Experience) (int, error) {
	if err := r.db.Create(experience).Error; err != nil {
		return 0, err
	}
	return experience.ID, nil
}

func (r *experienceRepository) Update(id int, experience *models.Experience) (*models.Experience, error) {
	experience.ID = id
	if err := r.db.Save(experience).Error; err != nil {
		return nil, err
	}
	return experience, nil
}

func (r *experienceRepository) UpdateOrderIndex(id int, order_index int) (*models.Experience, error) {
	if err := r.db.Model(&models.Experience{}).Where("id = ?", id).Update("order_index", order_index).Error; err != nil {
		return nil, err
	}
	var experience models.Experience
	if err := r.db.First(&experience, id).Error; err != nil {
		return nil, err
	}
	return &experience, nil
}

func (r *experienceRepository) Delete(id int) error {
	if err := r.db.Delete(&models.Experience{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *experienceRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&models.Experience{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
