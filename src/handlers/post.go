package handlers

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"anonchihaya.co.uk/src/util"
	"github.com/gin-gonic/gin"
)

// GetPostLatest godoc
// @Summary Get latest post
// @Tags post
// @Produce json
// @Success 200 {object} models.Post
// @Failure 500 {object} ErrorResponse
// @Router /post/latest [get]
func GetPostLatest(c *gin.Context, post_repo repositories.PostRepository) {
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
func GetPosts(c *gin.Context, post_repo repositories.PostRepository) {
	posts, err := post_repo.GetAll()
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
func GetPostsShort(c *gin.Context, post_repo repositories.PostRepository) {
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
func GetPost(c *gin.Context, post_repo repositories.PostRepository) {
	id := c.Param("id")
	postID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	post, err := post_repo.GetByID(postID)
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
func PostPost(c *gin.Context, post_repo repositories.PostRepository) {

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

	post := models.Post{
		ParentID:   postReq.ParentID,
		ParentType: "project",
		Name:       postReq.Name,
		ContentMD:  postReq.ContentMD,
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
func PutPost(c *gin.Context, post_repo repositories.PostRepository) {
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

	oldPost, err := post_repo.GetByID(putPostReq.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if oldPost == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Post not found"})
		return
	}

	var newPost models.Post
	newPost.ID = putPostReq.ID
	newPost.ParentID = oldPost.ParentID
	newPost.ParentType = oldPost.ParentType
	newPost.Name = util.PickOrDefault(putPostReq.Name, oldPost.Name)
	newPost.ContentMD = util.PickOrDefault(putPostReq.ContentMD, oldPost.ContentMD)

	updatedPost, err := post_repo.Update(newPost.ID, &newPost)
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
func DeletePost(c *gin.Context, post_repo repositories.PostRepository) {
	id := c.Param("id")
	postID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	err = post_repo.Delete(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"DeletePost() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
