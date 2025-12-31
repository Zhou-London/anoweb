package post

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type PostRepository interface {
	GetByID(id int) (*Post, error)
	GetShortByID(id int) (*PostShort, error)
	GetByProject(project_id int) ([]*Post, error)
	GetShortByProject(project_id int) ([]*PostShort, error)
	GetLatest() (*Post, error)
	GetAll() ([]*Post, error)
	Create(post *Post) (int, error)
	Update(id int, post *Post) (*Post, error)
	Delete(id int) error
	Counts() (int, error)
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository() PostRepository {
	return &postRepository{db: store.DB}
}

func (r *postRepository) GetByID(id int) (*Post, error) {
	var post Post
	if err := r.db.First(&post, id).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) GetShortByID(id int) (*PostShort, error) {
	var post PostShort
	if err := r.db.Model(&Post{}).Select("id", "parent_id", "parent_type", "name", "updated_at").First(&post, id).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) GetByProject(project_id int) ([]*Post, error) {
	var posts []*Post
	if err := r.db.Where("parent_id = ? AND parent_type = ?", project_id, "project").Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepository) GetShortByProject(project_id int) ([]*PostShort, error) {
	var posts []*PostShort
	if err := r.db.Model(&Post{}).
		Select("id", "parent_id", "parent_type", "name", "updated_at").
		Where("parent_id = ? AND parent_type = ?", project_id, "project").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepository) GetLatest() (*Post, error) {
	var post Post
	if err := r.db.Order("created_at DESC").First(&post).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) GetAll() ([]*Post, error) {
	var posts []*Post
	if err := r.db.Order("updated_at DESC").Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepository) Create(post *Post) (int, error) {
	if err := r.db.Create(post).Error; err != nil {
		return 0, err
	}
	return post.ID, nil
}

func (r *postRepository) Update(id int, post *Post) (*Post, error) {
	post.ID = id
	if err := r.db.Save(post).Error; err != nil {
		return nil, err
	}
	return post, nil
}

func (r *postRepository) Delete(id int) error {
	if err := r.db.Delete(&Post{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *postRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&Post{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
