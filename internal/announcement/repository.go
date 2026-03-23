package announcement

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type AnnouncementRepository interface {
	GetAll() ([]*Announcement, error)
	GetLatest() (*Announcement, error)
	GetByID(id int) (*Announcement, error)
	Create(a *Announcement) (int, error)
	Update(id int, a *Announcement) (*Announcement, error)
	Delete(id int) error
}

type announcementRepository struct {
	db *gorm.DB
}

func NewAnnouncementRepository() AnnouncementRepository {
	return &announcementRepository{db: store.DB}
}

func (r *announcementRepository) GetAll() ([]*Announcement, error) {
	var announcements []*Announcement
	if err := r.db.Order("created_at DESC").Find(&announcements).Error; err != nil {
		return nil, err
	}
	return announcements, nil
}

func (r *announcementRepository) GetLatest() (*Announcement, error) {
	var a Announcement
	if err := r.db.Order("created_at DESC").First(&a).Error; err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *announcementRepository) GetByID(id int) (*Announcement, error) {
	var a Announcement
	if err := r.db.First(&a, id).Error; err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *announcementRepository) Create(a *Announcement) (int, error) {
	if err := r.db.Create(a).Error; err != nil {
		return 0, err
	}
	return a.ID, nil
}

func (r *announcementRepository) Update(id int, a *Announcement) (*Announcement, error) {
	a.ID = id
	if err := r.db.Save(a).Error; err != nil {
		return nil, err
	}
	return a, nil
}

func (r *announcementRepository) Delete(id int) error {
	if err := r.db.Delete(&Announcement{}, id).Error; err != nil {
		return err
	}
	return nil
}
