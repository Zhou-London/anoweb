package post

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

const authorJoin = "LEFT JOIN users ON users.id = posts.author_id"
const authorPhotoCol = "COALESCE(users.profile_photo, '') AS author_photo"

// PostQuery selects, orders and slices the forum list. ProjectID is nil for
// every thread, 0 for general threads (no project, or one whose project has
// since been deleted) and >0 for a single project's threads. Limit 0 means
// "no paging" — return the whole filtered set.
type PostQuery struct {
	ProjectID *int
	Order     string
	Limit     int
	Offset    int
}

type PostRepository interface {
	GetByID(id int) (*Post, error)
	GetByIDWithAuthor(id int) (*PostWithAuthor, error)
	ListWithAuthor(q PostQuery) ([]*PostWithAuthor, int, error)
	GetShortByID(id int) (*PostShort, error)
	GetByProject(project_id int) ([]*Post, error)
	ListShortByProject(projectID, limit, offset int) ([]*PostShort, int, error)
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
	if err := r.db.Model(&Post{}).Select("id", "parent_id", "parent_type", "name", "author_name", "updated_at").First(&post, id).Error; err != nil {
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

// ListShortByProject returns one project's discussions, newest activity
// first, plus the unpaginated total. limit 0 returns them all.
func (r *postRepository) ListShortByProject(projectID, limit, offset int) ([]*PostShort, int, error) {
	scope := func() *gorm.DB {
		return r.db.Table("posts").
			Where("posts.parent_id = ? AND posts.parent_type = ?", projectID, "project")
	}

	total := 0
	if limit > 0 {
		var n int64
		if err := scope().Count(&n).Error; err != nil {
			return nil, 0, err
		}
		total = int(n)
	}

	db := scope().
		Select("posts.id, posts.parent_id, posts.parent_type, posts.name, posts.author_name, "+authorPhotoCol+", posts.updated_at").
		Joins(authorJoin).
		Order("posts.updated_at DESC, posts.id DESC")
	if limit > 0 {
		db = db.Limit(limit).Offset(offset)
	}

	posts := []*PostShort{}
	if err := db.Scan(&posts).Error; err != nil {
		return nil, 0, err
	}
	if limit == 0 {
		total = len(posts)
	}
	return posts, total, nil
}

// listScope builds the WHERE side of a PostQuery. Kept separate so the count
// and the page share exactly one definition of "which threads match".
func (r *postRepository) listScope(q PostQuery) *gorm.DB {
	db := r.db.Table("posts")
	switch {
	case q.ProjectID == nil:
		// Every thread.
	case *q.ProjectID == 0:
		// "General": no project parent, or a parent project that was deleted.
		db = db.Where(
			"posts.parent_type <> ? OR NOT EXISTS (SELECT 1 FROM projects WHERE projects.id = posts.parent_id)",
			"project",
		)
	default:
		db = db.Where("posts.parent_type = ? AND posts.parent_id = ?", "project", *q.ProjectID)
	}
	return db
}

// ListWithAuthor returns the filtered, ordered forum list plus the total
// number of matching threads (before paging) so the caller can size a pager.
func (r *postRepository) ListWithAuthor(q PostQuery) ([]*PostWithAuthor, int, error) {
	total := 0
	if q.Limit > 0 {
		var n int64
		if err := r.listScope(q).Count(&n).Error; err != nil {
			return nil, 0, err
		}
		total = int(n)
	}

	db := r.listScope(q).
		Select("posts.*, " + authorPhotoCol).
		Joins(authorJoin).
		Order(q.Order)
	if q.Limit > 0 {
		db = db.Limit(q.Limit).Offset(q.Offset)
	}

	posts := []*PostWithAuthor{}
	if err := db.Scan(&posts).Error; err != nil {
		return nil, 0, err
	}
	if q.Limit == 0 {
		total = len(posts)
	}
	return posts, total, nil
}

func (r *postRepository) GetByIDWithAuthor(id int) (*PostWithAuthor, error) {
	var post PostWithAuthor
	if err := r.db.Table("posts").
		Select("posts.*, "+authorPhotoCol).
		Joins(authorJoin).
		Where("posts.id = ?", id).
		Scan(&post).Error; err != nil {
		return nil, err
	}
	if post.ID == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &post, nil
}

// GetLatest returns the most recently *active* thread — ordered by
// updated_at, not created_at, so an edit to an old thread also counts. The
// header's "New" dot reads this.
func (r *postRepository) GetLatest() (*Post, error) {
	var post Post
	if err := r.db.Order("updated_at DESC, id DESC").First(&post).Error; err != nil {
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
