package repositories

import (
	"database/sql"

	"anonchihaya.co.uk/models"
)

type LearningRepository interface {
	GetByID(id int) (*models.Learning, error)
	GetAll() ([]*models.Learning, error)
	Create(learning *models.Learning) (int, error)
	Update(id int, learning *models.Learning) (*models.Learning, error)
	Delete(id int) error
	Counts() (int, error)
}

type learningRepository struct {
	db *sql.DB
}

func NewLearningRepository() LearningRepository {
	return &learningRepository{db: DB}
}

func (r *learningRepository) GetByID(id int) (*models.Learning, error) {
	row := r.db.QueryRow("SELECT id, topic, description, image_url, created_at, updated_at FROM learnings WHERE id = ?", id)

	var learning models.Learning
	err := row.Scan(&learning.ID, &learning.Topic, &learning.Description, &learning.ImageURL, &learning.CreatedAt, &learning.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &learning, nil
}

func (r *learningRepository) GetAll() ([]*models.Learning, error) {
	rows, err := r.db.Query("SELECT id, topic, description, image_url, created_at, updated_at FROM learnings")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var learnings []*models.Learning
	for rows.Next() {
		var learning models.Learning
		if err := rows.Scan(&learning.ID, &learning.Topic, &learning.Description, &learning.ImageURL, &learning.CreatedAt, &learning.UpdatedAt); err != nil {
			return nil, err
		}
		learnings = append(learnings, &learning)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return learnings, nil
}

func (r *learningRepository) Create(learning *models.Learning) (int, error) {
	result, err := r.db.Exec("INSERT INTO learnings (topic, description, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", learning.Topic, learning.Description, learning.ImageURL, learning.CreatedAt, learning.UpdatedAt)
	if err != nil {
		return 0, err
	}

	id, _ := result.LastInsertId()
	learning.ID = int(id)

	return int(id), nil
}

func (r *learningRepository) Update(id int, learning *models.Learning) (*models.Learning, error) {
	_, err := r.db.Exec("UPDATE learnings SET topic = ?, description = ?, image_url = ?, created_at = ?, updated_at = ? WHERE id = ?", learning.Topic, learning.Description, learning.ImageURL, learning.CreatedAt, learning.UpdatedAt, id)
	if err != nil {
		return nil, err
	}

	learning.ID = id
	return learning, nil
}

func (r *learningRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM learnings WHERE id = ?", id)
	if err != nil {
		return err
	}

	return nil
}

func (r *learningRepository) Counts() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM learnings").Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
