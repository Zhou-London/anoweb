package learning

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type LearningRepository interface {
	GetByID(id int) (*Learning, error)
	GetAll() ([]*Learning, error)
	Create(learning *Learning) (int, error)
	Update(id int, learning *Learning) (*Learning, error)
	Delete(id int) error
	Counts() (int, error)
}

type learningRepository struct {
	db *gorm.DB
}

func NewLearningRepository() LearningRepository {
	return &learningRepository{db: store.DB}
}

func (r *learningRepository) GetByID(id int) (*Learning, error) {
	var learning Learning
	if err := r.db.First(&learning, id).Error; err != nil {
		return nil, err
	}
	return &learning, nil
}

func (r *learningRepository) GetAll() ([]*Learning, error) {
	var learnings []*Learning
	if err := r.db.Find(&learnings).Error; err != nil {
		return nil, err
	}
	return learnings, nil
}

func (r *learningRepository) Create(learning *Learning) (int, error) {
	if err := r.db.Create(learning).Error; err != nil {
		return 0, err
	}
	return learning.ID, nil
}

func (r *learningRepository) Update(id int, learning *Learning) (*Learning, error) {
	learning.ID = id
	if err := r.db.Save(learning).Error; err != nil {
		return nil, err
	}
	return learning, nil
}

func (r *learningRepository) Delete(id int) error {
	if err := r.db.Delete(&Learning{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *learningRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&Learning{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
