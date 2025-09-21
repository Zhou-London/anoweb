package repositories

import (
	"database/sql"

	"anonchihaya.co.uk/models"
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
	db *sql.DB
}

func NewProjectRepository() ProjectRepository {
	return &projectRepository{db: DB}
}

func (r *projectRepository) GetByID(id int) (*models.Project, error) {
	row := r.db.QueryRow("SELECT id, name, description, link, image_url, created_at, updated_at FROM projects WHERE id = ?", id)

	var project models.Project
	err := row.Scan(&project.ID, &project.Name, &project.Description, &project.Link, &project.ImageURL, &project.CreatedAt, &project.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &project, nil
}

func (r *projectRepository) GetAll() ([]*models.Project, error) {
	rows, err := r.db.Query("SELECT id, name, description, link, image_url, created_at, updated_at FROM projects")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []*models.Project
	for rows.Next() {
		var project models.Project
		if err := rows.Scan(&project.ID, &project.Name, &project.Description, &project.Link, &project.ImageURL, &project.CreatedAt, &project.UpdatedAt); err != nil {
			return nil, err
		}
		projects = append(projects, &project)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

func (r *projectRepository) Create(project *models.Project) (int, error) {
	result, err := r.db.Exec("INSERT INTO projects (name, description, link, image_url) VALUES (?, ?, ?, ?)", project.Name, project.Description, project.Link, project.ImageURL)
	if err != nil {
		return 0, err
	}

	id, _ := result.LastInsertId()
	project.ID = int(id)

	return int(id), nil
}

func (r *projectRepository) Update(id int, project *models.Project) (*models.Project, error) {
	_, err := r.db.Exec("UPDATE projects SET name = ?, description = ?, link = ?, image_url = ? WHERE id = ?", project.Name, project.Description, project.Link, project.ImageURL, id)
	if err != nil {
		return nil, err
	}

	project.ID = id
	return project, nil
}

func (r *projectRepository) UpdateImageUrl(id int, image_url string) (*models.Project, error) {
	_, err := r.db.Exec("UPDATE projects SET image_url = ? WHERE id = ?", image_url, id)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (r *projectRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM projects WHERE id = ?", id)
	if err != nil {
		return err
	}

	return nil
}

func (r *projectRepository) Counts() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM projects").Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
