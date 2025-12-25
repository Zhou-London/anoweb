package repositories

import (
	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

type CoreSkillRepository interface {
	GetByID(id int) (*models.CoreSkill, error)
	GetAll() ([]*models.CoreSkill, error)
	Create(coreSkill *models.CoreSkill) (int, error)
	Update(id int, coreSkill *models.CoreSkill) (*models.CoreSkill, error)
	Delete(id int) error
	UpdateOrder(skills []models.CoreSkill) error
}

type coreSkillRepository struct {
	db *gorm.DB
}

func NewCoreSkillRepository() CoreSkillRepository {
	return &coreSkillRepository{db: DB}
}

func (r *coreSkillRepository) GetByID(id int) (*models.CoreSkill, error) {
	var coreSkill models.CoreSkill
	if err := r.db.First(&coreSkill, id).Error; err != nil {
		return nil, err
	}
	return &coreSkill, nil
}

func (r *coreSkillRepository) GetAll() ([]*models.CoreSkill, error) {
	var coreSkills []*models.CoreSkill
	if err := r.db.Order("order_index ASC").Find(&coreSkills).Error; err != nil {
		return nil, err
	}
	return coreSkills, nil
}

func (r *coreSkillRepository) Create(coreSkill *models.CoreSkill) (int, error) {
	if err := r.db.Create(coreSkill).Error; err != nil {
		return 0, err
	}
	return coreSkill.ID, nil
}

func (r *coreSkillRepository) Update(id int, coreSkill *models.CoreSkill) (*models.CoreSkill, error) {
	updates := map[string]interface{}{
		"name":          coreSkill.Name,
		"bullet_points": coreSkill.BulletPoints,
		"order_index":   coreSkill.OrderIndex,
	}

	if err := r.db.Model(&models.CoreSkill{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return nil, err
	}

	var updated models.CoreSkill
	if err := r.db.First(&updated, id).Error; err != nil {
		return nil, err
	}

	return &updated, nil
}

func (r *coreSkillRepository) Delete(id int) error {
	if err := r.db.Delete(&models.CoreSkill{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *coreSkillRepository) UpdateOrder(skills []models.CoreSkill) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, skill := range skills {
			if err := tx.Model(&models.CoreSkill{}).Where("id = ?", skill.ID).Update("order_index", skill.OrderIndex).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
