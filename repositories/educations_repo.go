package repositories

import (
	"database/sql"

	"anonchihaya.co.uk/models"
)

type EducationRepository interface {
	GetByID(id int) (*models.Education, error)
	GetAll() ([]*models.Education, error)
	Create(education *models.Education) (int, error)
	Update(id int, education *models.Education) (*models.Education, error)
	Delete(id int) error
	Counts() (int, error)
}

type educationRepository struct {
	db *sql.DB
}

func NewEducationRepository() EducationRepository {
	return &educationRepository{db: DB}
}

func (r *educationRepository) GetByID(id int) (*models.Education, error) {
	row := r.db.QueryRow("SELECT id, school, degree, start_date, end_date, link, image_url FROM educations WHERE id = ?", id)

	var education models.Education
	err := row.Scan(&education.ID, &education.School, &education.Degree, &education.StartDate, &education.EndDate, &education.Link, &education.ImageURL)

	if err != nil {
		return nil, err
	}
	return &education, nil
}

func (r *educationRepository) GetAll() ([]*models.Education, error) {
	rows, err := r.db.Query("SELECT id, school, degree, start_date, end_date, link, image_url FROM educations")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var educations []*models.Education
	for rows.Next() {
		var education models.Education
		if err := rows.Scan(&education.ID, &education.School, &education.Degree, &education.StartDate, &education.EndDate, &education.Link, &education.ImageURL); err != nil {
			return nil, err
		}
		educations = append(educations, &education)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return educations, nil
}

func (r *educationRepository) Create(education *models.Education) (int, error) {
	result, err := r.db.Exec("INSERT INTO educations (school, degree, start_date, end_date, link, image_url) VALUES (?, ?, ?, ?, ?, ?)", education.School, education.Degree, education.StartDate, education.EndDate, education.Link, education.ImageURL)
	if err != nil {
		return 0, err
	}

	id, _ := result.LastInsertId()
	education.ID = int(id)

	return int(id), nil
}

func (r *educationRepository) Update(id int, education *models.Education) (*models.Education, error) {
	_, err := r.db.Exec("UPDATE educations SET school = ?, degree = ?, start_date = ?, end_date = ?, link = ?, image_url = ? WHERE id = ?", education.School, education.Degree, education.StartDate, education.EndDate, education.Link, education.ImageURL, id)
	if err != nil {
		return nil, err
	}

	education.ID = id
	return education, nil
}

func (r *educationRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM educations WHERE id = ?", id)
	if err != nil {
		return err
	}

	return nil
}

func (r *educationRepository) Counts() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM educations").Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
