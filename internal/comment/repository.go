package comment

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type CommentRepository interface {
	GetByPost(postID int) ([]*CommentWithMeta, error)
	GetByID(id uint) (*Comment, error)
	Create(comment *Comment) error
	Delete(id uint) error
	ToggleLike(commentID, fanID uint) (hasLiked bool, likesCount int64, err error)
	LikedSet(fanID uint, commentIDs []uint) (map[uint]bool, error)
}

type commentRepository struct {
	db *gorm.DB
}

func NewCommentRepository() CommentRepository {
	return &commentRepository{db: store.DB}
}

func (r *commentRepository) GetByPost(postID int) ([]*CommentWithMeta, error) {
	var comments []*CommentWithMeta
	if err := r.db.Table("comments").
		Select("comments.*, COALESCE(users.profile_photo, '') AS author_photo").
		Joins("LEFT JOIN users ON users.id = comments.author_id").
		Where("comments.post_id = ?", postID).
		Order("comments.created_at ASC").
		Scan(&comments).Error; err != nil {
		return nil, err
	}
	return comments, nil
}

func (r *commentRepository) GetByID(id uint) (*Comment, error) {
	var comment Comment
	if err := r.db.First(&comment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &comment, nil
}

func (r *commentRepository) Create(comment *Comment) error {
	return r.db.Create(comment).Error
}

// Delete removes a comment, all its descendant replies, and their likes.
func (r *commentRepository) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		ids := []uint{id}
		frontier := []uint{id}
		for len(frontier) > 0 {
			var children []uint
			if err := tx.Model(&Comment{}).
				Where("parent_id IN ?", frontier).
				Pluck("id", &children).Error; err != nil {
				return err
			}
			ids = append(ids, children...)
			frontier = children
		}
		if err := tx.Where("comment_id IN ?", ids).Delete(&CommentLike{}).Error; err != nil {
			return err
		}
		return tx.Where("id IN ?", ids).Delete(&Comment{}).Error
	})
}

func (r *commentRepository) ToggleLike(commentID, fanID uint) (bool, int64, error) {
	var hasLiked bool
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var existing CommentLike
		err := tx.Where("comment_id = ? AND fan_id = ?", commentID, fanID).First(&existing).Error
		switch err {
		case nil:
			if err := tx.Delete(&existing).Error; err != nil {
				return err
			}
			hasLiked = false
			return tx.Model(&Comment{}).Where("id = ?", commentID).
				Update("likes_count", gorm.Expr("GREATEST(likes_count - 1, 0)")).Error
		case gorm.ErrRecordNotFound:
			if err := tx.Create(&CommentLike{CommentID: commentID, FanID: fanID}).Error; err != nil {
				return err
			}
			hasLiked = true
			return tx.Model(&Comment{}).Where("id = ?", commentID).
				Update("likes_count", gorm.Expr("likes_count + 1")).Error
		default:
			return err
		}
	})
	if err != nil {
		return false, 0, err
	}
	var count int64
	if err := r.db.Model(&Comment{}).Select("likes_count").
		Where("id = ?", commentID).Scan(&count).Error; err != nil {
		return hasLiked, 0, err
	}
	return hasLiked, count, nil
}

func (r *commentRepository) LikedSet(fanID uint, commentIDs []uint) (map[uint]bool, error) {
	liked := make(map[uint]bool, len(commentIDs))
	if len(commentIDs) == 0 {
		return liked, nil
	}
	var ids []uint
	if err := r.db.Model(&CommentLike{}).
		Where("fan_id = ? AND comment_id IN ?", fanID, commentIDs).
		Pluck("comment_id", &ids).Error; err != nil {
		return nil, err
	}
	for _, id := range ids {
		liked[id] = true
	}
	return liked, nil
}
