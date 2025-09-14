package repositories

import (
	"database/sql"

	"anonchihaya.co.uk/models"
)

type ExperienceRepository interface {
	GetByID(id int) (*models.Experience, error)
	GetAll() ([]*models.Experience, error)
	GetAllShort() ([]*models.ExperienceShort, error)
	Create(experience *models.Experience) (int, error)
	Update(id int, experience *models.Experience) (*models.Experience, error)
	Delete(id int) error
	Counts() (int, error)
}

type experienceRepository struct {
	db *sql.DB
}

func NewExperienceRepository() ExperienceRepository {
	return &experienceRepository{db: DB}
}

func (r *experienceRepository) GetByID(id int) (*models.Experience, error) {
	row := r.db.QueryRow("SELECT id, company, position, start_date, end_date, present, description, image_url FROM experiences WHERE id = ?", id)

	var experience models.Experience
	err := row.Scan(&experience.ID, &experience.Company, &experience.Position, &experience.StartDate, &experience.EndDate, &experience.Present, &experience.Description, &experience.ImageURL)
	if err != nil {
		return nil, err
	}

	return &experience, nil
}

func (r *experienceRepository) GetAll() ([]*models.Experience, error) {
	rows, err := r.db.Query("SELECT id, company, position, start_date, end_date, present, description, image_url FROM experiences")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var experiences []*models.Experience
	for rows.Next() {
		var experience models.Experience
		if err := rows.Scan(&experience.ID, &experience.Company, &experience.Position, &experience.StartDate, &experience.EndDate, &experience.Present, &experience.Description, &experience.ImageURL); err != nil {
			return nil, err
		}
		experiences = append(experiences, &experience)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return experiences, nil
}

func (r *experienceRepository) GetAllShort() ([]*models.ExperienceShort, error) {
	rows, err := r.db.Query("SELECT id, company, position, start_date, end_date, present, image_url FROM experiences")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var experiences []*models.ExperienceShort
	for rows.Next() {
		var experience models.ExperienceShort
		if err := rows.Scan(&experience.ID, &experience.Company, &experience.Position, &experience.StartDate, &experience.EndDate, &experience.Present, &experience.ImageURL); err != nil {
			return nil, err
		}
		experiences = append(experiences, &experience)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return experiences, nil

}

func (r *experienceRepository) Create(experience *models.Experience) (int, error) {
	result, err := r.db.Exec("INSERT INTO experiences (company, position, start_date, end_date, present, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)", experience.Company, experience.Position, experience.StartDate, experience.EndDate, experience.Present, experience.Description, experience.ImageURL)
	if err != nil {
		return 0, err
	}

	id, _ := result.LastInsertId()
	experience.ID = int(id)

	return int(id), nil
}

func (r *experienceRepository) Update(id int, experience *models.Experience) (*models.Experience, error) {
	_, err := r.db.Exec("UPDATE experiences SET company = ?, position = ?, start_date = ?, end_date = ?, present = ?, description = ?, image_url = ? WHERE id = ?", experience.Company, experience.Position, experience.StartDate, experience.EndDate, experience.Present, experience.Description, experience.ImageURL, id)
	if err != nil {
		return nil, err
	}

	experience.ID = id
	return experience, nil
}

func (r *experienceRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM experiences WHERE id = ?", id)
	if err != nil {
		return err
	}

	return nil
}

func (r *experienceRepository) Counts() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM experiences").Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
