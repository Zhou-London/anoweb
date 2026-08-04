package comment

import (
	"net/http"
	"strconv"
	"strings"

	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/post"
	"github.com/gin-gonic/gin"
)

func currentFan(c *gin.Context) *auth.Fan {
	user, ok := c.Get("user")
	if !ok {
		return nil
	}
	fan, _ := user.(*auth.Fan)
	return fan
}

// GetCommentsByPost returns all comments of a post as a flat list (the
// frontend builds the reply tree from parent_id). With a valid session,
// has_liked is filled in for the requesting fan.
func GetCommentsByPost(c *gin.Context, repo CommentRepository) {
	postID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	comments, err := repo.GetByPost(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if comments == nil {
		comments = []*CommentWithMeta{}
	}

	if fan := currentFan(c); fan != nil && len(comments) > 0 {
		ids := make([]uint, len(comments))
		for i, cm := range comments {
			ids[i] = cm.ID
		}
		liked, err := repo.LikedSet(fan.ID, ids)
		if err == nil {
			for _, cm := range comments {
				cm.HasLiked = liked[cm.ID]
			}
		}
	}

	c.JSON(http.StatusOK, comments)
}

// PostComment creates a comment or a reply. Auth required.
func PostComment(c *gin.Context, repo CommentRepository, postRepo post.PostRepository) {
	type Req struct {
		PostID   int    `json:"post_id" binding:"required"`
		ParentID *uint  `json:"parent_id"`
		Content  string `json:"content" binding:"required"`
	}

	var req Req
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.Content = strings.TrimSpace(req.Content)
	if req.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Comment cannot be empty"})
		return
	}
	if len(req.Content) > MaxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Comment exceeds 2,000 character limit"})
		return
	}

	fan := currentFan(c)
	if fan == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	if _, err := postRepo.GetShortByID(req.PostID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Post not found"})
		return
	}

	if req.ParentID != nil {
		parent, err := repo.GetByID(*req.ParentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if parent == nil || parent.PostID != req.PostID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parent comment not found on this post"})
			return
		}
	}

	comment := Comment{
		PostID:     req.PostID,
		ParentID:   req.ParentID,
		AuthorID:   fan.ID,
		AuthorName: fan.Username,
		Content:    req.Content,
	}
	if err := repo.Create(&comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, CommentWithMeta{
		Comment:     comment,
		AuthorPhoto: fan.ProfilePhoto,
	})
}

// ToggleCommentLike toggles the requesting fan's like on a comment.
func ToggleCommentLike(c *gin.Context, repo CommentRepository) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}
	fan := currentFan(c)
	if fan == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	existing, err := repo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if existing == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Comment not found"})
		return
	}

	hasLiked, count, err := repo.ToggleLike(uint(id), fan.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"has_liked": hasLiked, "likes_count": count})
}

// DeleteComment removes a comment (and its replies). Authors may delete
// their own comments; admins may delete any.
func DeleteComment(c *gin.Context, repo CommentRepository) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}
	fan := currentFan(c)
	if fan == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	existing, err := repo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if existing == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Comment not found"})
		return
	}
	if !fan.IsAdmin && existing.AuthorID != fan.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own comments"})
		return
	}

	if err := repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}
