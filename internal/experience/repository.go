package experience

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type ExperienceRepository interface {
	GetByID(id int) (*Experience, error)
	GetAll() ([]*Experience, error)
	GetAllShort() ([]*ExperienceShort, error)
	Create(experience *Experience) (int, error)
	Update(id int, experience *Experience) (*Experience, error)
	UpdateOrderIndex(id int, order_index int) (*Experience, error)
	Delete(id int) error
	Counts() (int, error)
}

type experienceRepository struct {
	db *gorm.DB
}

func NewExperienceRepository() ExperienceRepository {
	return &experienceRepository{db: store.DB}
}

func (r *experienceRepository) GetByID(id int) (*Experience, error) {
	var experience Experience
	if err := r.db.First(&experience, id).Error; err != nil {
		return nil, err
	}
	return &experience, nil
}

func (r *experienceRepository) GetAll() ([]*Experience, error) {
	var experiences []*Experience
	if err := r.db.Order("order_index ASC").Find(&experiences).Error; err != nil {
		return nil, err
	}
	return experiences, nil
}

func (r *experienceRepository) GetAllShort() ([]*ExperienceShort, error) {
	var experiences []*ExperienceShort
	if err := r.db.Model(&Experience{}).Order("order_index ASC").Find(&experiences).Error; err != nil {
		return nil, err
	}
	return experiences, nil
}

func (r *experienceRepository) Create(experience *Experience) (int, error) {
	if err := r.db.Create(experience).Error; err != nil {
		return 0, err
	}
	return experience.ID, nil
}

func (r *experienceRepository) Update(id int, experience *Experience) (*Experience, error) {
	experience.ID = id
	if err := r.db.Save(experience).Error; err != nil {
		return nil, err
	}
	return experience, nil
}

func (r *experienceRepository) UpdateOrderIndex(id int, order_index int) (*Experience, error) {
	if err := r.db.Model(&Experience{}).Where("id = ?", id).Update("order_index", order_index).Error; err != nil {
		return nil, err
	}
	var experience Experience
	if err := r.db.First(&experience, id).Error; err != nil {
		return nil, err
	}
	return &experience, nil
}

func (r *experienceRepository) Delete(id int) error {
	if err := r.db.Delete(&Experience{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *experienceRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&Experience{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
