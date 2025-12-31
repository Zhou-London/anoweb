package mysterycode

import (
	"time"

	"gorm.io/gorm"
)

type MysteryCodeRepository struct {
	db *gorm.DB
}

func NewMysteryCodeRepository(db *gorm.DB) *MysteryCodeRepository {
	return &MysteryCodeRepository{db: db}
}

// CreateCode creates a new mystery code
func (r *MysteryCodeRepository) CreateCode(code string) (*MysteryCode, error) {
	mysteryCode := &MysteryCode{
		Code:   code,
		IsUsed: false,
	}
	if err := r.db.Create(mysteryCode).Error; err != nil {
		return nil, err
	}
	return mysteryCode, nil
}

// VerifyAndUseCode verifies a code and marks it as used
func (r *MysteryCodeRepository) VerifyAndUseCode(code string, userID uint) error {
	var mysteryCode MysteryCode

	if err := r.db.Where("code = ? AND is_used = ?", code, false).First(&mysteryCode).Error; err != nil {
		return err
	}

	now := time.Now()
	return r.db.Model(&mysteryCode).Updates(map[string]interface{}{
		"is_used": true,
		"used_by": userID,
		"used_at": now,
	}).Error
}

// IsCodeValid checks if a code exists and is not used
func (r *MysteryCodeRepository) IsCodeValid(code string) (bool, error) {
	var count int64
	if err := r.db.Model(&MysteryCode{}).
		Where("code = ? AND is_used = ?", code, false).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetAllCodes returns all mystery codes (admin only)
func (r *MysteryCodeRepository) GetAllCodes() ([]MysteryCode, error) {
	var codes []MysteryCode
	if err := r.db.Order("created_at DESC").Find(&codes).Error; err != nil {
		return nil, err
	}
	return codes, nil
}
