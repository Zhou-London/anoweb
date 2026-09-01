package blog

import (
	"net/http"
	"strconv"
	"unicode/utf8"

	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/util"
	"github.com/gin-gonic/gin"
)

// MaxContentLength is in characters (runes), matching the frontend counter.
// Sized for HTML mode, whose markup runs 2-3x the prose it wraps.
const MaxContentLength = 60000

// GetBlogs godoc
// @Summary List all blogs
// @Description Always ordered by newest activity. Without ?page= the response
// @Description is a bare array of every post; with it, a util.PagedResponse
// @Description envelope.
// @Tags blog
// @Produce json
// @Param page query int false "1-based page number; omit for the full list"
// @Param page_size query int false "Rows per page (default 10, max 100)"
// @Success 200 {array} BlogShort
// @Failure 500 {object} ErrorResponse
// @Router /blog [get]
func GetBlogs(c *gin.Context, blogRepo BlogRepository) {
	page, paged := util.ParsePage(c.Query("page"), c.Query("page_size"))
	limit, offset := 0, 0
	if paged {
		limit, offset = page.Limit(), page.Offset()
	}

	blogs, total, err := blogRepo.List(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if paged {
		c.JSON(http.StatusOK, util.NewPagedResponse(blogs, total, page))
		return
	}
	c.JSON(http.StatusOK, blogs)
}

// GetRecentBlogs godoc
// @Summary Get recent blogs for home page
// @Tags blog
// @Produce json
// @Success 200 {array} BlogShort
// @Failure 500 {object} ErrorResponse
// @Router /blog/recent [get]
func GetRecentBlogs(c *gin.Context, blogRepo BlogRepository) {
	blogs, err := blogRepo.GetRecent(3)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, blogs)
}

// GetBlog godoc
// @Summary Get single blog with content
// @Tags blog
// @Produce json
// @Param id path int true "Blog ID"
// @Success 200 {object} BlogWithLikeStatus
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /blog/{id} [get]
func GetBlog(c *gin.Context, blogRepo BlogRepository, blogLikeRepo BlogLikeRepository) {
	id := c.Param("id")
	blogID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog ID"})
		return
	}

	blog, err := blogRepo.GetByID(blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Check if authenticated user has liked the blog
	hasLiked := false
	if user, exists := c.Get("user"); exists {
		if fan, ok := user.(*auth.Fan); ok && fan != nil {
			hasLiked, _ = blogLikeRepo.HasLiked(blogID, fan.ID)
		}
	}

	response := BlogWithLikeStatus{
		Blog:     *blog,
		HasLiked: hasLiked,
	}

	c.JSON(http.StatusOK, response)
}

// CreateBlog godoc
// @Summary Create new blog
// @Tags blog
// @Accept json
// @Produce json
// @Param body body CreateBlogRequest true "Blog data"
// @Success 201 {object} Blog
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /blog [post]
func CreateBlog(c *gin.Context, blogRepo BlogRepository) {
	type CreateBlogReq struct {
		Title     string `json:"title" binding:"required"`
		ContentMD string `json:"content_md"`
		Format    string `json:"format"`
		ImageURL  string `json:"image_url"`
	}

	var req CreateBlogReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Omitted format means markdown (pre-HTML clients).
	if req.Format == "" {
		req.Format = util.FormatMarkdown
	}
	if !util.ValidFormat(req.Format) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format must be markdown or html"})
		return
	}

	// Blogs are admin-only, so no extra role check here: an HTML body is a
	// raw uploaded document capped by file size; markdown keeps the editor's
	// character limit.
	if req.Format == util.FormatHTML {
		if len(req.ContentMD) > util.MaxHTMLBytes {
			c.JSON(http.StatusBadRequest, gin.H{"error": "HTML content exceeds the 1MB limit"})
			return
		}
	} else if utf8.RuneCountInString(req.ContentMD) > MaxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content exceeds 60,000 character limit"})
		return
	}

	blog := Blog{
		Title:     req.Title,
		ContentMD: req.ContentMD,
		Format:    req.Format,
		ImageURL:  req.ImageURL,
	}

	id, err := blogRepo.Create(&blog)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	blog.ID = id
	c.JSON(http.StatusCreated, blog)
}

// UpdateBlog godoc
// @Summary Update blog
// @Tags blog
// @Accept json
// @Produce json
// @Param body body UpdateBlogRequest true "Blog fields"
// @Success 200 {object} Blog
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /blog [put]
func UpdateBlog(c *gin.Context, blogRepo BlogRepository) {
	type UpdateBlogReq struct {
		ID        int    `json:"id" binding:"required"`
		Title     string `json:"title"`
		ContentMD string `json:"content_md"`
		Format    string `json:"format"`
		ImageURL  string `json:"image_url"`
	}

	var req UpdateBlogReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Empty keeps the stored format, like the other fields.
	if req.Format != "" && !util.ValidFormat(req.Format) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format must be markdown or html"})
		return
	}

	oldBlog, err := blogRepo.GetByID(req.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if oldBlog == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Blog not found"})
		return
	}

	var newBlog Blog
	newBlog.ID = req.ID
	newBlog.Title = util.PickOrDefault(req.Title, oldBlog.Title)
	newBlog.ContentMD = util.PickOrDefault(req.ContentMD, oldBlog.ContentMD)
	newBlog.Format = util.PickOrDefault(req.Format, oldBlog.Format)
	newBlog.ImageURL = util.PickOrDefault(req.ImageURL, oldBlog.ImageURL)
	newBlog.Views = oldBlog.Views
	newBlog.LikesCount = oldBlog.LikesCount
	newBlog.CreatedAt = oldBlog.CreatedAt

	// Validate the merged result — the edit may have changed the content, the
	// format, or both. HTML is capped by file size; markdown keeps the
	// editor's character limit.
	if newBlog.Format == util.FormatHTML {
		if len(newBlog.ContentMD) > util.MaxHTMLBytes {
			c.JSON(http.StatusBadRequest, gin.H{"error": "HTML content exceeds the 1MB limit"})
			return
		}
	} else if utf8.RuneCountInString(newBlog.ContentMD) > MaxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content exceeds 60,000 character limit"})
		return
	}

	updatedBlog, err := blogRepo.Update(newBlog.ID, &newBlog)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedBlog)
}

// DeleteBlog godoc
// @Summary Delete blog
// @Tags blog
// @Produce json
// @Param id path int true "Blog ID"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /blog/{id} [delete]
func DeleteBlog(c *gin.Context, blogRepo BlogRepository) {
	id := c.Param("id")
	blogID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog ID"})
		return
	}

	if err := blogRepo.Delete(blogID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog deleted successfully"})
}

// UpdateBlogImage godoc
// @Summary Update blog cover image
// @Tags blog
// @Accept json
// @Produce json
// @Param body body UpdateBlogImageRequest true "Image URL"
// @Success 200 {object} Blog
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /blog/update-image-url [post]
func UpdateBlogImage(c *gin.Context, blogRepo BlogRepository) {
	type UpdateImageReq struct {
		ID       int    `json:"id" binding:"required"`
		ImageURL string `json:"image_url" binding:"required"`
	}

	var req UpdateImageReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	blog, err := blogRepo.UpdateImageUrl(req.ID, req.ImageURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, blog)
}

// IncrementView godoc
// @Summary Increment blog view count
// @Tags blog
// @Produce json
// @Param id path int true "Blog ID"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /blog/{id}/view [post]
func IncrementView(c *gin.Context, blogRepo BlogRepository) {
	id := c.Param("id")
	blogID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog ID"})
		return
	}

	// The admin's own visits don't count as readership.
	if user, exists := c.Get("user"); exists {
		if fan, ok := user.(*auth.Fan); ok && fan != nil && fan.IsAdmin {
			c.JSON(http.StatusOK, gin.H{"message": "View not counted"})
			return
		}
	}

	// One view per visitor per blog per dedup window.
	if !shouldCountView(c, blogID) {
		c.JSON(http.StatusOK, gin.H{"message": "View not counted"})
		return
	}

	if err := blogRepo.IncrementViews(blogID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "View incremented"})
}

// ToggleLike godoc
// @Summary Toggle like on blog
// @Tags blog
// @Produce json
// @Param id path int true "Blog ID"
// @Success 200 {object} ToggleLikeResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /blog/{id}/like [post]
func ToggleLike(c *gin.Context, blogRepo BlogRepository, blogLikeRepo BlogLikeRepository) {
	id := c.Param("id")
	blogID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog ID"})
		return
	}

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	fan, ok := user.(*auth.Fan)
	if !ok || fan == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
		return
	}

	hasLiked, err := blogLikeRepo.HasLiked(blogID, fan.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if hasLiked {
		// Unlike
		if err := blogLikeRepo.Unlike(blogID, fan.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err := blogRepo.DecrementLikesCount(blogID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		// Like
		if err := blogLikeRepo.Like(blogID, fan.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err := blogRepo.IncrementLikesCount(blogID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// Get updated blog for response
	blog, err := blogRepo.GetByID(blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"has_liked":   !hasLiked,
		"likes_count": blog.LikesCount,
	})
}
