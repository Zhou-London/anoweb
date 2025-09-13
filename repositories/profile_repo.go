package repositories

import (
	"database/sql"

	"anonchihaya.co.uk/models"
)

type ProfileRepository interface {
	GetByID(id int) (*models.Profile, error)
	Create(profile *models.Profile) error
	Update(profile *models.Profile) (*models.Profile, error)
	Delete(id int) error
	Counts() (int, error)
}

// * Profile Repository Implementation (MySql)
type profileRepository struct {
	db *sql.DB
}

func NewProfileRepository() ProfileRepository {
	return &profileRepository{db: DB}
}

func (r *profileRepository) GetByID(id int) (*models.Profile, error) {

	row := r.db.QueryRow("SELECT * FROM profile_info WHERE id = ?", id)

	var profile models.Profile
	err := row.Scan(&profile.ID, &profile.Name, &profile.Email, &profile.Github, &profile.Linkedin, &profile.Bio)
	if err != nil {
		return nil, err
	}

	return &profile, nil
}

func (r *profileRepository) Create(profile *models.Profile) error {
	result, err := r.db.Exec("INSERT INTO profile_info (name, email, github, linkedin, bio) VALUES (?, ?, ?, ?, ?)", profile.Name, profile.Email, profile.Github, profile.Linkedin, profile.Bio)
	if err != nil {
		return nil
	}

	id, _ := result.LastInsertId()
	profile.ID = int(id)

	return nil
}

func (r *profileRepository) Update(profile *models.Profile) (*models.Profile, error) {
	_, err := r.db.Exec("UPDATE profile_info SET name = ?, email = ?, github = ?, linkedin = ?, bio = ? WHERE id = ?", profile.Name, profile.Email, profile.Github, profile.Linkedin, profile.Bio, profile.ID)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (r *profileRepository) Delete(id int) error {

	_, err := r.db.Exec("DELETE FROM profile_info WHERE id = ?", id)
	if err != nil {
		return err
	}

	return nil
}

func (r *profileRepository) Counts() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM profile_info").Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
