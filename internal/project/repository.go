package project

import (
	"time"

	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

// ProjectQuery orders and slices the project list. Limit 0 means "no paging"
// — return every project.
type ProjectQuery struct {
	Order  string
	Limit  int
	Offset int
}

type ProjectRepository interface {
	GetByID(id int) (*Project, error)
	GetAll() ([]*Project, error)
	List(q ProjectQuery) ([]*Project, int, error)
	Create(project *Project) (int, error)
	Update(id int, project *Project) (*Project, error)
	UpdateImageUrl(id int, image_url string) (*Project, error)
	Delete(id int) error
	Counts() (int, error)
	Touch(id int) error
	BackfillActivity() (int64, error)
}

type projectRepository struct {
	db *gorm.DB
}

func NewProjectRepository() ProjectRepository {
	return &projectRepository{db: store.DB}
}

func (r *projectRepository) GetByID(id int) (*Project, error) {
	var project Project
	if err := r.db.First(&project, id).Error; err != nil {
		return nil, err
	}
	return &project, nil
}

func (r *projectRepository) GetAll() ([]*Project, error) {
	var projects []*Project
	if err := r.db.Order("created_at DESC").Find(&projects).Error; err != nil {
		return nil, err
	}
	return projects, nil
}

// List returns the ordered project list plus the total row count (before
// paging) so the caller can size a pager.
func (r *projectRepository) List(q ProjectQuery) ([]*Project, int, error) {
	total := 0
	if q.Limit > 0 {
		var n int64
		if err := r.db.Model(&Project{}).Count(&n).Error; err != nil {
			return nil, 0, err
		}
		total = int(n)
	}

	db := r.db.Model(&Project{}).Order(q.Order)
	if q.Limit > 0 {
		db = db.Limit(q.Limit).Offset(q.Offset)
	}

	projects := []*Project{}
	if err := db.Find(&projects).Error; err != nil {
		return nil, 0, err
	}
	if q.Limit == 0 {
		total = len(projects)
	}
	return projects, total, nil
}

func (r *projectRepository) Create(project *Project) (int, error) {
	if err := r.db.Create(project).Error; err != nil {
		return 0, err
	}
	return project.ID, nil
}

func (r *projectRepository) Update(id int, project *Project) (*Project, error) {
	project.ID = id
	if err := r.db.Save(project).Error; err != nil {
		return nil, err
	}
	return project, nil
}

func (r *projectRepository) UpdateImageUrl(id int, image_url string) (*Project, error) {
	if err := r.db.Model(&Project{}).Where("id = ?", id).Update("image_url", image_url).Error; err != nil {
		return nil, err
	}
	var project Project
	if err := r.db.First(&project, id).Error; err != nil {
		return nil, err
	}
	return &project, nil
}

func (r *projectRepository) Delete(id int) error {
	if err := r.db.Delete(&Project{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *projectRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&Project{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}

// Touch stamps the project as active right now. Called whenever one of its
// discussions is posted or edited, so `?sort=updated` and the "New" badge —
// which both read updated_at — follow forum activity without the list having
// to join posts and take a MAX(updated_at) per row on every request.
//
// updated_at therefore means "last activity": an admin editing the project
// counts too. Deleting a discussion deliberately does not roll it back —
// there is no separate record of the project's own last edit to fall back to.
func (r *projectRepository) Touch(id int) error {
	// UpdateColumn: a single-column write, no hooks, and no second automatic
	// updated_at fighting the value being set here.
	return r.db.Model(&Project{}).Where("id = ?", id).
		UpdateColumn("updated_at", time.Now()).Error
}

// BackfillActivity lifts every project whose newest discussion is more recent
// than its own updated_at, catching up rows that predate Touch. Idempotent:
// once a project's updated_at has reached its newest post, the WHERE matches
// nothing, so this is safe to run at every boot.
func (r *projectRepository) BackfillActivity() (int64, error) {
	res := r.db.Exec(`
		UPDATE projects p
		JOIN (
			SELECT parent_id, MAX(updated_at) AS last_post
			FROM posts
			WHERE parent_type = 'project'
			GROUP BY parent_id
		) a ON a.parent_id = p.id
		SET p.updated_at = a.last_post
		WHERE a.last_post > p.updated_at`)
	return res.RowsAffected, res.Error
}
