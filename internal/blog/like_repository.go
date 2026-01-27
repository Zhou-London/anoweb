package blog

import (
	"errors"

	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type BlogLikeRepository interface {
	HasLiked(blogID int, fanID uint) (bool, error)
	Like(blogID int, fanID uint) error
	Unlike(blogID int, fanID uint) error
	GetLikesByBlog(blogID int) ([]*BlogLike, error)
	CountLikes(blogID int) (int64, error)
}

type blogLikeRepository struct {
	db *gorm.DB
}

func NewBlogLikeRepository() BlogLikeRepository {
	return &blogLikeRepository{db: store.DB}
}

func (r *blogLikeRepository) HasLiked(blogID int, fanID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&BlogLike{}).Where("blog_id = ? AND fan_id = ?", blogID, fanID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *blogLikeRepository) Like(blogID int, fanID uint) error {
	like := BlogLike{
		BlogID: blogID,
		FanID:  fanID,
	}
	return r.db.Create(&like).Error
}

func (r *blogLikeRepository) Unlike(blogID int, fanID uint) error {
	result := r.db.Where("blog_id = ? AND fan_id = ?", blogID, fanID).Delete(&BlogLike{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("like not found")
	}
	return nil
}

func (r *blogLikeRepository) GetLikesByBlog(blogID int) ([]*BlogLike, error) {
	var likes []*BlogLike
	if err := r.db.Where("blog_id = ?", blogID).Find(&likes).Error; err != nil {
		return nil, err
	}
	return likes, nil
}

func (r *blogLikeRepository) CountLikes(blogID int) (int64, error) {
	var count int64
	if err := r.db.Model(&BlogLike{}).Where("blog_id = ?", blogID).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
