package blog

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type BlogRepository interface {
	GetByID(id int) (*Blog, error)
	GetAll() ([]*BlogShort, error)
	List(limit, offset int) ([]*BlogShort, int, error)
	GetRecent(limit int) ([]*BlogShort, error)
	Create(blog *Blog) (int, error)
	Update(id int, blog *Blog) (*Blog, error)
	Delete(id int) error
	Counts() (int, error)
	IncrementViews(id int) error
	UpdateImageUrl(id int, imageUrl string) (*Blog, error)
	IncrementLikesCount(id int) error
	DecrementLikesCount(id int) error
}

type blogRepository struct {
	db *gorm.DB
}

func NewBlogRepository() BlogRepository {
	return &blogRepository{db: store.DB}
}

func (r *blogRepository) GetByID(id int) (*Blog, error) {
	var blog Blog
	if err := r.db.First(&blog, id).Error; err != nil {
		return nil, err
	}
	return &blog, nil
}

func (r *blogRepository) GetAll() ([]*BlogShort, error) {
	var blogs []*BlogShort
	if err := r.db.Model(&Blog{}).
		Select("id", "title", "image_url", "views", "likes_count", "created_at", "updated_at").
		Order("updated_at DESC").
		Find(&blogs).Error; err != nil {
		return nil, err
	}
	return blogs, nil
}

// List returns one page of the blog index (newest activity first) plus the
// total post count. limit 0 returns every post.
func (r *blogRepository) List(limit, offset int) ([]*BlogShort, int, error) {
	total := 0
	if limit > 0 {
		var n int64
		if err := r.db.Model(&Blog{}).Count(&n).Error; err != nil {
			return nil, 0, err
		}
		total = int(n)
	}

	db := r.db.Model(&Blog{}).
		Select("id", "title", "image_url", "views", "likes_count", "created_at", "updated_at").
		Order("updated_at DESC, id DESC")
	if limit > 0 {
		db = db.Limit(limit).Offset(offset)
	}

	blogs := []*BlogShort{}
	if err := db.Find(&blogs).Error; err != nil {
		return nil, 0, err
	}
	if limit == 0 {
		total = len(blogs)
	}
	return blogs, total, nil
}

func (r *blogRepository) GetRecent(limit int) ([]*BlogShort, error) {
	var blogs []*BlogShort
	if err := r.db.Model(&Blog{}).
		Select("id", "title", "image_url", "views", "likes_count", "created_at", "updated_at").
		Order("updated_at DESC").
		Limit(limit).
		Find(&blogs).Error; err != nil {
		return nil, err
	}
	return blogs, nil
}

func (r *blogRepository) Create(blog *Blog) (int, error) {
	if err := r.db.Create(blog).Error; err != nil {
		return 0, err
	}
	return blog.ID, nil
}

func (r *blogRepository) Update(id int, blog *Blog) (*Blog, error) {
	blog.ID = id
	if err := r.db.Save(blog).Error; err != nil {
		return nil, err
	}
	return blog, nil
}

func (r *blogRepository) Delete(id int) error {
	if err := r.db.Delete(&Blog{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *blogRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&Blog{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}

func (r *blogRepository) IncrementViews(id int) error {
	return r.db.Model(&Blog{}).Where("id = ?", id).UpdateColumn("views", gorm.Expr("views + 1")).Error
}

func (r *blogRepository) UpdateImageUrl(id int, imageUrl string) (*Blog, error) {
	var blog Blog
	if err := r.db.First(&blog, id).Error; err != nil {
		return nil, err
	}
	blog.ImageURL = imageUrl
	if err := r.db.Save(&blog).Error; err != nil {
		return nil, err
	}
	return &blog, nil
}

func (r *blogRepository) IncrementLikesCount(id int) error {
	return r.db.Model(&Blog{}).Where("id = ?", id).UpdateColumn("likes_count", gorm.Expr("likes_count + 1")).Error
}

func (r *blogRepository) DecrementLikesCount(id int) error {
	return r.db.Model(&Blog{}).Where("id = ?", id).UpdateColumn("likes_count", gorm.Expr("GREATEST(likes_count - 1, 0)")).Error
}
