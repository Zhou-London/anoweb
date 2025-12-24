package repositories

import (
	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

type PostRepository interface {
	GetByID(id int) (*models.Post, error)
	GetShortByID(id int) (*models.PostShort, error)
	GetByProject(project_id int) ([]*models.Post, error)
	GetShortByProject(project_id int) ([]*models.PostShort, error)
	GetLatest() (*models.Post, error)
	GetAll() ([]*models.Post, error)
	Create(post *models.Post) (int, error)
	Update(id int, post *models.Post) (*models.Post, error)
	Delete(id int) error
	Counts() (int, error)
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository() PostRepository {
	return &postRepository{db: DB}
}

func (r *postRepository) GetByID(id int) (*models.Post, error) {
	var post models.Post
	if err := r.db.First(&post, id).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) GetShortByID(id int) (*models.PostShort, error) {
	var post models.PostShort
	if err := r.db.Model(&models.Post{}).Select("id", "parent_id", "parent_type", "name", "updated_at").First(&post, id).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) GetByProject(project_id int) ([]*models.Post, error) {
	var posts []*models.Post
	if err := r.db.Where("parent_id = ? AND parent_type = ?", project_id, "project").Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepository) GetShortByProject(project_id int) ([]*models.PostShort, error) {
	var posts []*models.PostShort
	if err := r.db.Model(&models.Post{}).
		Select("id", "parent_id", "parent_type", "name", "updated_at").
		Where("parent_id = ? AND parent_type = ?", project_id, "project").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepository) GetLatest() (*models.Post, error) {
	var post models.Post
	if err := r.db.Order("created_at DESC").First(&post).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) GetAll() ([]*models.Post, error) {
	var posts []*models.Post
	if err := r.db.Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepository) Create(post *models.Post) (int, error) {
	if err := r.db.Create(post).Error; err != nil {
		return 0, err
	}
	return post.ID, nil
}

func (r *postRepository) Update(id int, post *models.Post) (*models.Post, error) {
	post.ID = id
	if err := r.db.Save(post).Error; err != nil {
		return nil, err
	}
	return post, nil
}

func (r *postRepository) Delete(id int) error {
	if err := r.db.Delete(&models.Post{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *postRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&models.Post{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
