package repositories

import (
	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

type EducationRepository interface {
	GetByID(id int) (*models.Education, error)
	GetAll() ([]*models.Education, error)
	Create(education *models.Education) (int, error)
	Update(id int, education *models.Education) (*models.Education, error)
	UpdateImageUrl(id int, image_url string) (*models.Education, error)
	Delete(id int) error
	Counts() (int, error)
}

type educationRepository struct {
	db *gorm.DB
}

func NewEducationRepository() EducationRepository {
	return &educationRepository{db: DB}
}

func (r *educationRepository) GetByID(id int) (*models.Education, error) {
	var education models.Education
	if err := r.db.First(&education, id).Error; err != nil {
		return nil, err
	}
	return &education, nil
}

func (r *educationRepository) GetAll() ([]*models.Education, error) {
	var educations []*models.Education
	if err := r.db.Find(&educations).Error; err != nil {
		return nil, err
	}
	return educations, nil
}

func (r *educationRepository) Create(education *models.Education) (int, error) {
	if err := r.db.Create(education).Error; err != nil {
		return 0, err
	}
	return education.ID, nil
}

func (r *educationRepository) Update(id int, education *models.Education) (*models.Education, error) {
	education.ID = id
	if err := r.db.Save(education).Error; err != nil {
		return nil, err
	}
	return education, nil
}

func (r *educationRepository) UpdateImageUrl(id int, image_url string) (*models.Education, error) {
	if err := r.db.Model(&models.Education{}).Where("id = ?", id).Update("image_url", image_url).Error; err != nil {
		return nil, err
	}
	var education models.Education
	if err := r.db.First(&education, id).Error; err != nil {
		return nil, err
	}
	return &education, nil
}

func (r *educationRepository) Delete(id int) error {
	if err := r.db.Delete(&models.Education{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *educationRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&models.Education{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
