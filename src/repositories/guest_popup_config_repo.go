package repositories

import (
	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

type GuestPopupConfigRepository struct {
	db *gorm.DB
}

func NewGuestPopupConfigRepository(db *gorm.DB) *GuestPopupConfigRepository {
	return &GuestPopupConfigRepository{db: db}
}

// GetActiveConfig returns the active popup configuration
func (r *GuestPopupConfigRepository) GetActiveConfig() (*models.GuestPopupConfig, error) {
	var config models.GuestPopupConfig
	if err := r.db.Where("is_active = ?", true).First(&config).Error; err != nil {
		return nil, err
	}
	return &config, nil
}

// CreateConfig creates a new popup configuration
func (r *GuestPopupConfigRepository) CreateConfig(title, benefits string) (*models.GuestPopupConfig, error) {
	config := &models.GuestPopupConfig{
		Title:    title,
		Benefits: benefits,
		IsActive: true,
	}
	if err := r.db.Create(config).Error; err != nil {
		return nil, err
	}
	return config, nil
}

// UpdateConfig updates an existing popup configuration
func (r *GuestPopupConfigRepository) UpdateConfig(id uint, title, benefits string) error {
	return r.db.Model(&models.GuestPopupConfig{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"title":    title,
			"benefits": benefits,
		}).Error
}

// SetActive sets a specific config as active and deactivates others
func (r *GuestPopupConfigRepository) SetActive(id uint) error {
	// Deactivate all configs
	if err := r.db.Model(&models.GuestPopupConfig{}).Updates(map[string]interface{}{"is_active": false}).Error; err != nil {
		return err
	}
	// Activate the specified config
	return r.db.Model(&models.GuestPopupConfig{}).Where("id = ?", id).Update("is_active", true).Error
}

// GetAllConfigs returns all popup configurations
func (r *GuestPopupConfigRepository) GetAllConfigs() ([]models.GuestPopupConfig, error) {
	var configs []models.GuestPopupConfig
	if err := r.db.Order("created_at DESC").Find(&configs).Error; err != nil {
		return nil, err
	}
	return configs, nil
}
