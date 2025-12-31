package guestpopup

import (
	"gorm.io/gorm"
)

type GuestPopupConfigRepository struct {
	db *gorm.DB
}

func NewGuestPopupConfigRepository(db *gorm.DB) *GuestPopupConfigRepository {
	return &GuestPopupConfigRepository{db: db}
}

// GetActiveConfig returns the active popup configuration
func (r *GuestPopupConfigRepository) GetActiveConfig() (*GuestPopupConfig, error) {
	var config GuestPopupConfig
	if err := r.db.Where("is_active = ?", true).First(&config).Error; err != nil {
		return nil, err
	}
	return &config, nil
}

// CreateConfig creates a new popup configuration
func (r *GuestPopupConfigRepository) CreateConfig(title, benefits string) (*GuestPopupConfig, error) {
	config := &GuestPopupConfig{
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
	return r.db.Model(&GuestPopupConfig{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"title":    title,
			"benefits": benefits,
		}).Error
}

// SetActive sets a specific config as active and deactivates others
func (r *GuestPopupConfigRepository) SetActive(id uint) error {
	// Deactivate all configs
	if err := r.db.Model(&GuestPopupConfig{}).Updates(map[string]interface{}{"is_active": false}).Error; err != nil {
		return err
	}
	// Activate the specified config
	return r.db.Model(&GuestPopupConfig{}).Where("id = ?", id).Update("is_active", true).Error
}

// GetAllConfigs returns all popup configurations
func (r *GuestPopupConfigRepository) GetAllConfigs() ([]GuestPopupConfig, error) {
	var configs []GuestPopupConfig
	if err := r.db.Order("created_at DESC").Find(&configs).Error; err != nil {
		return nil, err
	}
	return configs, nil
}
