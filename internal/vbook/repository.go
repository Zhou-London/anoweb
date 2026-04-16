package vbook

import (
	"errors"

	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type VBookRepository interface {
	GetByID(id int) (*VBook, error)
	GetBySlug(slug string) (*VBook, error)
	GetAll() ([]*VBookShort, error)
	Create(vb *VBook) (int, error)
	Update(id int, vb *VBook) (*VBook, error)
	UpdateImageURL(id int, url string) (*VBook, error)
	Delete(id int) error
}

type vbookRepository struct {
	db *gorm.DB
}

func NewVBookRepository() VBookRepository {
	return &vbookRepository{db: store.DB}
}

func (r *vbookRepository) GetByID(id int) (*VBook, error) {
	var vb VBook
	if err := r.db.First(&vb, id).Error; err != nil {
		return nil, err
	}
	return &vb, nil
}

func (r *vbookRepository) GetBySlug(slug string) (*VBook, error) {
	var vb VBook
	if err := r.db.Where("slug = ?", slug).First(&vb).Error; err != nil {
		return nil, err
	}
	return &vb, nil
}

func (r *vbookRepository) GetAll() ([]*VBookShort, error) {
	var rows []*VBookShort
	if err := r.db.Model(&VBook{}).
		Select("id", "slug", "title", "description", "cover_image_url", "order_index", "created_at", "updated_at").
		Order("order_index ASC, created_at ASC").
		Find(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *vbookRepository) Create(vb *VBook) (int, error) {
	if err := r.db.Create(vb).Error; err != nil {
		return 0, err
	}
	return vb.ID, nil
}

func (r *vbookRepository) Update(id int, vb *VBook) (*VBook, error) {
	vb.ID = id
	if err := r.db.Save(vb).Error; err != nil {
		return nil, err
	}
	return vb, nil
}

func (r *vbookRepository) UpdateImageURL(id int, url string) (*VBook, error) {
	var vb VBook
	if err := r.db.First(&vb, id).Error; err != nil {
		return nil, err
	}
	vb.CoverImageURL = url
	if err := r.db.Save(&vb).Error; err != nil {
		return nil, err
	}
	return &vb, nil
}

func (r *vbookRepository) Delete(id int) error {
	return r.db.Delete(&VBook{}, id).Error
}

type VBookProgressRepository interface {
	MarkCompleted(fanID uint, vbookID int, chapterID, sectionID string) error
	UnmarkCompleted(fanID uint, vbookID int, chapterID, sectionID string) error
	ResetForVBook(fanID uint, vbookID int) error
	ResetChapter(fanID uint, vbookID int, chapterID string) error
	GetForFanVBook(fanID uint, vbookID int) ([]*VBookProgress, error)
	DeleteByFanID(fanID uint) error
	UpsertLastRead(fanID uint, vbookID int, chapterID, sectionID string) error
	GetLastRead(fanID uint, vbookID int) (*VBookLastRead, error)
	DeleteLastReadByFanID(fanID uint) error
}

type vbookProgressRepository struct {
	db *gorm.DB
}

func NewVBookProgressRepository() VBookProgressRepository {
	return &vbookProgressRepository{db: store.DB}
}

func (r *vbookProgressRepository) MarkCompleted(fanID uint, vbookID int, chapterID, sectionID string) error {
	var existing VBookProgress
	err := r.db.Where("fan_id = ? AND v_book_id = ? AND chapter_id = ? AND section_id = ?",
		fanID, vbookID, chapterID, sectionID).First(&existing).Error
	if err == nil {
		return nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	row := VBookProgress{
		FanID:     fanID,
		VBookID:   vbookID,
		ChapterID: chapterID,
		SectionID: sectionID,
	}
	return r.db.Create(&row).Error
}

func (r *vbookProgressRepository) UnmarkCompleted(fanID uint, vbookID int, chapterID, sectionID string) error {
	return r.db.Where("fan_id = ? AND v_book_id = ? AND chapter_id = ? AND section_id = ?",
		fanID, vbookID, chapterID, sectionID).Delete(&VBookProgress{}).Error
}

func (r *vbookProgressRepository) ResetForVBook(fanID uint, vbookID int) error {
	return r.db.Where("fan_id = ? AND v_book_id = ?", fanID, vbookID).Delete(&VBookProgress{}).Error
}

func (r *vbookProgressRepository) GetForFanVBook(fanID uint, vbookID int) ([]*VBookProgress, error) {
	var rows []*VBookProgress
	if err := r.db.Where("fan_id = ? AND v_book_id = ?", fanID, vbookID).
		Order("chapter_id ASC, section_id ASC").
		Find(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *vbookProgressRepository) DeleteByFanID(fanID uint) error {
	return r.db.Where("fan_id = ?", fanID).Delete(&VBookProgress{}).Error
}

func (r *vbookProgressRepository) ResetChapter(fanID uint, vbookID int, chapterID string) error {
	return r.db.Where("fan_id = ? AND v_book_id = ? AND chapter_id = ?",
		fanID, vbookID, chapterID).Delete(&VBookProgress{}).Error
}

func (r *vbookProgressRepository) UpsertLastRead(fanID uint, vbookID int, chapterID, sectionID string) error {
	var existing VBookLastRead
	err := r.db.Where("fan_id = ? AND v_book_id = ?", fanID, vbookID).First(&existing).Error
	if err == nil {
		return r.db.Model(&existing).Updates(map[string]interface{}{
			"chapter_id": chapterID,
			"section_id": sectionID,
		}).Error
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	return r.db.Create(&VBookLastRead{
		FanID:     fanID,
		VBookID:   vbookID,
		ChapterID: chapterID,
		SectionID: sectionID,
	}).Error
}

func (r *vbookProgressRepository) GetLastRead(fanID uint, vbookID int) (*VBookLastRead, error) {
	var lr VBookLastRead
	if err := r.db.Where("fan_id = ? AND v_book_id = ?", fanID, vbookID).First(&lr).Error; err != nil {
		return nil, err
	}
	return &lr, nil
}

func (r *vbookProgressRepository) DeleteLastReadByFanID(fanID uint) error {
	return r.db.Where("fan_id = ?", fanID).Delete(&VBookLastRead{}).Error
}
