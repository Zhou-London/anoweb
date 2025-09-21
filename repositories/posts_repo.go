package repositories

import (
	"database/sql"

	"anonchihaya.co.uk/models"
)

type PostRepository interface {
	GetByID(id int) (*models.Post, error)
	GetShortByID(id int) (*models.PostShort, error)
	GetByProject(project_id int) ([]*models.Post, error)
	GetShortByProject(project_id int) ([]*models.PostShort, error)
	GetAll() ([]*models.Post, error)
	Create(post *models.Post) (int, error)
	Update(id int, post *models.Post) (*models.Post, error)
	Delete(id int) error
	Counts() (int, error)
}

type postRepository struct {
	db *sql.DB
}

func NewPostRepository() PostRepository {
	return &postRepository{db: DB}
}

func (r *postRepository) GetByID(id int) (*models.Post, error) {
	row := r.db.QueryRow("SELECT id, parent_id, parent_type, name, content_md, created_at, updated_at FROM posts WHERE id = ?", id)

	var post models.Post
	err := row.Scan(&post.ID, &post.ParentID, &post.ParentType, &post.Name, &post.ContentMD, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *postRepository) GetShortByID(id int) (*models.PostShort, error) {
	row := r.db.QueryRow("SELECT id, parent_id, parent_type, name, updated_at FROM posts WHERE id = ?", id)

	var post models.PostShort
	err := row.Scan(&post.ID, &post.ParentID, &post.ParentType, &post.Name, &post.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *postRepository) GetByProject(project_id int) ([]*models.Post, error) {
	rows, err := r.db.Query("SELECT id, parent_id, parent_type, name, content_md, created_at, updated_at FROM posts WHERE parent_id = ? AND parent_type = 'project'", project_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []*models.Post
	for rows.Next() {
		var post models.Post
		if err := rows.Scan(&post.ID, &post.ParentID, &post.ParentType, &post.Name, &post.ContentMD, &post.CreatedAt, &post.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, &post)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *postRepository) GetShortByProject(project_id int) ([]*models.PostShort, error) {
	rows, err := r.db.Query("SELECT id, parent_id, parent_type, name, updated_at FROM posts WHERE parent_id = ? AND parent_type = 'project'", project_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []*models.PostShort
	for rows.Next() {
		var post models.PostShort
		if err := rows.Scan(&post.ID, &post.ParentID, &post.ParentType, &post.Name, &post.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, &post)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil

}

func (r *postRepository) GetAll() ([]*models.Post, error) {
	rows, err := r.db.Query("SELECT id, parent_id, parent_type, name, content_md, created_at, updated_at FROM posts")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []*models.Post
	for rows.Next() {
		var post models.Post
		if err := rows.Scan(&post.ID, &post.ParentID, &post.ParentType, &post.Name, &post.ContentMD, &post.CreatedAt, &post.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, &post)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *postRepository) Create(post *models.Post) (int, error) {
	result, err := r.db.Exec("INSERT INTO posts (parent_id, parent_type, name, content_md) VALUES (?, ?, ?, ?)", post.ParentID, post.ParentType, post.Name, post.ContentMD)
	if err != nil {
		return 0, err
	}

	id, _ := result.LastInsertId()
	post.ID = int(id)

	return int(id), nil
}

func (r *postRepository) Update(id int, post *models.Post) (*models.Post, error) {
	_, err := r.db.Exec("UPDATE posts SET parent_id = ?, parent_type = ?, name = ?, content_md = ? WHERE id = ?", post.ParentID, post.ParentType, post.Name, post.ContentMD, id)
	if err != nil {
		return nil, err
	}

	post.ID = id
	return post, nil
}

func (r *postRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM posts WHERE id = ?", id)
	if err != nil {
		return err
	}

	return nil
}

func (r *postRepository) Counts() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM posts").Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
