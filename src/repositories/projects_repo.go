package repositories

import (
	"anonchihaya.co.uk/src/models"
	"gorm.io/gorm"
)

type ProjectRepository interface {
	GetByID(id int) (*models.Project, error)
	GetAll() ([]*models.Project, error)
	Create(project *models.Project) (int, error)
	Update(id int, project *models.Project) (*models.Project, error)
	UpdateImageUrl(id int, image_url string) (*models.Project, error)
	Delete(id int) error
	Counts() (int, error)
}

type projectRepository struct {
	db *gorm.DB
}

func NewProjectRepository() ProjectRepository {
	return &projectRepository{db: DB}
}

func (r *projectRepository) GetByID(id int) (*models.Project, error) {
	var project models.Project
	if err := r.db.First(&project, id).Error; err != nil {
		return nil, err
	}
	return &project, nil
}

func (r *projectRepository) GetAll() ([]*models.Project, error) {
	var projects []*models.Project
	if err := r.db.Order("created_at DESC").Find(&projects).Error; err != nil {
		return nil, err
	}
	return projects, nil
}

func (r *projectRepository) Create(project *models.Project) (int, error) {
	if err := r.db.Create(project).Error; err != nil {
		return 0, err
	}
	return project.ID, nil
}

func (r *projectRepository) Update(id int, project *models.Project) (*models.Project, error) {
	project.ID = id
	if err := r.db.Save(project).Error; err != nil {
		return nil, err
	}
	return project, nil
}

func (r *projectRepository) UpdateImageUrl(id int, image_url string) (*models.Project, error) {
	if err := r.db.Model(&models.Project{}).Where("id = ?", id).Update("image_url", image_url).Error; err != nil {
		return nil, err
	}
	var project models.Project
	if err := r.db.First(&project, id).Error; err != nil {
		return nil, err
	}
	return &project, nil
}

func (r *projectRepository) Delete(id int) error {
	if err := r.db.Delete(&models.Project{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *projectRepository) Counts() (int, error) {
	var count int64
	if err := r.db.Model(&models.Project{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
