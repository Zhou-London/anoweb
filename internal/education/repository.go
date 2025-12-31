package education

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type EducationRepository interface {
	GetByID(id int) (*Education, error)
	GetAll() ([]*Education, error)
	Create(education *Education) (int, error)
	Update(id int, education *Education) (*Education, error)
	UpdateImageUrl(id int, image_url string) (*Education, error)
	Delete(id int) error
	Counts() (int, error)
}

type educationRepository struct {
	db *gorm.DB
}

func NewEducationRepository() EducationRepository {
	return &educationRepository{db: store.DB}
}

func (r *educationRepository) GetByID(id int) (*Education, error) {
	var education Education
	if err := r.db.First(&education, id).Error; err != nil {
		return nil, err
	}
	return &education, nil
}

func (r *educationRepository) GetAll() ([]*Education, error) {
	var educations []*Education
	if err := r.db.Find(&educations).Error; err != nil {
		return nil, err
	}
	return educations, nil
}

func (r *educationRepository) Create(education *Education) (int, error) {
	if err := r.db.Create(education).Error; err != nil {
		return 0, err
	}
	return education.ID, nil
}

func (r *educationRepository) Update(id int, education *Education) (*Education, error) {
	education.ID = id
	if err := r.db.Save(education).Error; err != nil {
		return nil, err
	}
	return education, nil
}

func (r *educationRepository) UpdateImageUrl(id int, image_url string) (*Education, error) {
	if err := r.db.Model(&Education{}).Where("id = ?", id).Update("image_url", image_url).Error; err != nil {
		return nil, err
	}
	var education Education
	if err := r.db.First(&education, id).Error; err != nil {
		return nil, err
	}
	return &education, nil
}

func (r *educationRepository) Delete(id int) error {
	if err := r.db.Delete(&Education{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *educationRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&Education{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
