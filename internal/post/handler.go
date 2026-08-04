package post

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/util"
	"github.com/gin-gonic/gin"
)

const MaxContentLength = 7500

// currentFan extracts the authenticated fan set by AuthMiddleware.
func currentFan(c *gin.Context) *auth.Fan {
	user, ok := c.Get("user")
	if !ok {
		return nil
	}
	fan, _ := user.(*auth.Fan)
	return fan
}

// canModify reports whether the fan may edit or delete the post:
// admins always, authors their own posts.
func canModify(fan *auth.Fan, post *Post) bool {
	if fan == nil {
		return false
	}
	if fan.IsAdmin {
		return true
	}
	return post.AuthorID != nil && *post.AuthorID == fan.ID
}

// GetPostLatest godoc
// @Summary Get latest post
// @Tags post
// @Produce json
// @Success 200 {object} models.Post
// @Failure 500 {object} ErrorResponse
// @Router /post/latest [get]
func GetPostLatest(c *gin.Context, post_repo PostRepository) {
	post, err := post_repo.GetLatest()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetPostLatest() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, post)
}

// GetPosts godoc
// @Summary List posts
// @Tags post
// @Produce json
// @Success 200 {array} models.Post
// @Failure 500 {object} ErrorResponse
// @Router /post [get]
func GetPosts(c *gin.Context, post_repo PostRepository) {
	posts, err := post_repo.GetAllWithAuthor()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

// GetPostsShort godoc
// @Summary List posts for project
// @Tags post
// @Produce json
// @Param id path int true "Project ID"
// @Success 200 {array} models.Post
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /post/project/{id} [get]
func GetPostsShort(c *gin.Context, post_repo PostRepository) {
	id := c.Param("id")
	projectID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	posts, err := post_repo.GetShortByProject(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

// GetPost godoc
// @Summary Get post
// @Tags post
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} models.Post
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /post/{id} [get]
func GetPost(c *gin.Context, post_repo PostRepository) {
	id := c.Param("id")
	postID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	post, err := post_repo.GetByIDWithAuthor(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, post)
}

// PostPost godoc
// @Summary Create post
// @Tags post
// @Accept json
// @Produce json
// @Param body body PostCreateRequest true "Post"
// @Success 201 {object} models.Post
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /post [post]
func PostPost(c *gin.Context, post_repo PostRepository) {

	type PostPostReq struct {
		ParentID  int    `json:"parent_id"`
		Name      string `json:"name"`
		ContentMD string `json:"content_md"`
	}

	var postReq PostPostReq
	if err := c.ShouldBindJSON(&postReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate content length
	if len(postReq.ContentMD) > MaxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content exceeds 7,500 character limit"})
		return
	}

	fan := currentFan(c)
	if fan == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// Posts may live under a project or stand alone as general discussions.
	parentType := "general"
	if postReq.ParentID > 0 {
		parentType = "project"
	}

	post := Post{
		ParentID:   postReq.ParentID,
		ParentType: parentType,
		Name:       postReq.Name,
		ContentMD:  postReq.ContentMD,
		AuthorID:   &fan.ID,
		AuthorName: fan.Username,
	}

	id, err := post_repo.Create(&post)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	post.ID = id
	c.JSON(http.StatusCreated, post)
}

// PutPost godoc
// @Summary Update post
// @Tags post
// @Accept json
// @Produce json
// @Param body body PostUpdateRequest true "Post fields"
// @Success 200 {object} models.Post
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /post [put]
func PutPost(c *gin.Context, post_repo PostRepository) {
	type PutPostReq struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		ContentMD string `json:"content_md"`
	}

	var putPostReq PutPostReq
	if err := c.ShouldBindJSON(&putPostReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate content length
	if len(putPostReq.ContentMD) > MaxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content exceeds 7,500 character limit"})
		return
	}

	oldPost, err := post_repo.GetByID(putPostReq.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if oldPost == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Post not found"})
		return
	}

	if !canModify(currentFan(c), oldPost) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only edit your own posts"})
		return
	}

	// Mutate the loaded row so author, parent and created_at survive the
	// repository's full-row Save.
	oldPost.Name = util.PickOrDefault(putPostReq.Name, oldPost.Name)
	oldPost.ContentMD = util.PickOrDefault(putPostReq.ContentMD, oldPost.ContentMD)

	updatedPost, err := post_repo.Update(oldPost.ID, oldPost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedPost)
}

// DeletePost godoc
// @Summary Delete post
// @Tags post
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /post/{id} [delete]
func DeletePost(c *gin.Context, post_repo PostRepository) {
	id := c.Param("id")
	postID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	existing, err := post_repo.GetByID(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"DeletePost() error": err.Error()})
		return
	}
	if existing == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Post not found"})
		return
	}
	if !canModify(currentFan(c), existing) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own posts"})
		return
	}

	err = post_repo.Delete(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"DeletePost() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
