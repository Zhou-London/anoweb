package repositories

import (
	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

type SkillRepository interface {
	GetByID(id int) (*models.Skill, error)
	GetAll() ([]*models.Skill, error)
	Create(skill *models.Skill) (int, error)
	Update(id int, skill *models.Skill) (*models.Skill, error)
	UpdateOrderIndex(id int, order_index int) (*models.Skill, error)
	Delete(id int) error
	Counts() (int, error)
}

type skillRepository struct {
	db *gorm.DB
}

func NewSkillRepository() SkillRepository {
	return &skillRepository{db: DB}
}

func (r *skillRepository) GetByID(id int) (*models.Skill, error) {
	var skill models.Skill
	if err := r.db.First(&skill, id).Error; err != nil {
		return nil, err
	}
	return &skill, nil
}

func (r *skillRepository) GetAll() ([]*models.Skill, error) {
	var skills []*models.Skill
	if err := r.db.Order("order_index ASC").Find(&skills).Error; err != nil {
		return nil, err
	}
	return skills, nil
}

func (r *skillRepository) Create(skill *models.Skill) (int, error) {
	if err := r.db.Create(skill).Error; err != nil {
		return 0, err
	}
	return skill.ID, nil
}

func (r *skillRepository) Update(id int, skill *models.Skill) (*models.Skill, error) {
	skill.ID = id
	if err := r.db.Save(skill).Error; err != nil {
		return nil, err
	}
	return skill, nil
}

func (r *skillRepository) UpdateOrderIndex(id int, order_index int) (*models.Skill, error) {
	if err := r.db.Model(&models.Skill{}).Where("id = ?", id).Update("order_index", order_index).Error; err != nil {
		return nil, err
	}
	var skill models.Skill
	if err := r.db.First(&skill, id).Error; err != nil {
		return nil, err
	}
	return &skill, nil
}

func (r *skillRepository) Delete(id int) error {
	if err := r.db.Delete(&models.Skill{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *skillRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&models.Skill{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
