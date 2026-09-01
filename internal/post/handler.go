package post

import (
	"log"
	"net/http"
	"strconv"
	"unicode/utf8"

	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/util"
	"github.com/gin-gonic/gin"
)

// MaxContentLength is in characters (runes), matching the frontend counter.
// Sized for HTML mode, whose markup runs 2-3x the prose it wraps.
const MaxContentLength = 30000

// ProjectToucher stamps a project as active when one of its discussions
// changes. project.ProjectRepository satisfies it; declaring the one method
// here keeps internal/post from importing internal/project.
type ProjectToucher interface {
	Touch(id int) error
}

// touchParentProject marks the project this thread belongs to as active, so
// the project list's "newest" order and "New" badge track discussion activity.
// Best-effort: the post is already written, and a failed stamp only costs the
// project its place at the top of the list.
func touchParentProject(projects ProjectToucher, post *Post) {
	if post.ParentType != "project" {
		return
	}
	if err := projects.Touch(post.ParentID); err != nil {
		log.Printf("project activity: post %d: failed to stamp project %d: %v", post.ID, post.ParentID, err)
	}
}

// postSortFields whitelists the ?sort= values the forum list accepts; see
// util.OrderClause — anything else falls back to newest activity first.
var postSortFields = map[string]util.SortField{
	"name":    {Column: "posts.name", DefaultDir: "ASC"},
	"updated": {Column: "posts.updated_at", DefaultDir: "DESC"},
	"created": {Column: "posts.created_at", DefaultDir: "DESC"},
}

const (
	postOrderFallback = "posts.updated_at DESC"
	postOrderTiebreak = "posts.id DESC"
)

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
// @Description Filtering, ordering and paging all happen here. Without ?page=
// @Description the response is a bare array of every matching thread; with it
// @Description the response is a util.PagedResponse envelope.
// @Tags post
// @Produce json
// @Param project query int false "Filter: 0 = general threads, N = project N's threads, omitted = all"
// @Param sort query string false "name | updated | created" Enums(name, updated, created)
// @Param order query string false "asc | desc" Enums(asc, desc)
// @Param page query int false "1-based page number; omit for the full list"
// @Param page_size query int false "Rows per page (default 10, max 100)"
// @Success 200 {array} models.Post
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /post [get]
func GetPosts(c *gin.Context, post_repo PostRepository) {
	q := PostQuery{
		Order: util.OrderClause(
			c.Query("sort"), c.Query("order"),
			postSortFields, postOrderFallback, postOrderTiebreak,
		),
	}

	if raw := c.Query("project"); raw != "" {
		projectID, err := strconv.Atoi(raw)
		if err != nil || projectID < 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project filter"})
			return
		}
		q.ProjectID = &projectID
	}

	page, paged := util.ParsePage(c.Query("page"), c.Query("page_size"))
	if paged {
		q.Limit, q.Offset = page.Limit(), page.Offset()
	}

	posts, total, err := post_repo.ListWithAuthor(q)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if paged {
		c.JSON(http.StatusOK, util.NewPagedResponse(posts, total, page))
		return
	}
	c.JSON(http.StatusOK, posts)
}

// GetPostsShort godoc
// @Summary List posts for project
// @Description Always ordered by newest activity. Without ?page= the response
// @Description is a bare array; with it, a util.PagedResponse envelope.
// @Tags post
// @Produce json
// @Param id path int true "Project ID"
// @Param page query int false "1-based page number; omit for the full list"
// @Param page_size query int false "Rows per page (default 10, max 100)"
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

	page, paged := util.ParsePage(c.Query("page"), c.Query("page_size"))
	limit, offset := 0, 0
	if paged {
		limit, offset = page.Limit(), page.Offset()
	}

	posts, total, err := post_repo.ListShortByProject(projectID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if paged {
		c.JSON(http.StatusOK, util.NewPagedResponse(posts, total, page))
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
func PostPost(c *gin.Context, post_repo PostRepository, project_repo ProjectToucher) {

	type PostPostReq struct {
		ParentID  int    `json:"parent_id"`
		Name      string `json:"name"`
		ContentMD string `json:"content_md"`
		Format    string `json:"format"`
	}

	var postReq PostPostReq
	if err := c.ShouldBindJSON(&postReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Omitted format means markdown (pre-HTML clients).
	if postReq.Format == "" {
		postReq.Format = util.FormatMarkdown
	}
	if !util.ValidFormat(postReq.Format) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format must be markdown or html"})
		return
	}

	fan := currentFan(c)
	if fan == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// An HTML body is a raw uploaded document rendered without sanitisation,
	// so only admins may store one; it is capped by file size. Markdown keeps
	// the editor's character limit.
	if postReq.Format == util.FormatHTML {
		if !fan.IsAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can post HTML content"})
			return
		}
		if len(postReq.ContentMD) > util.MaxHTMLBytes {
			c.JSON(http.StatusBadRequest, gin.H{"error": "HTML content exceeds the 1MB limit"})
			return
		}
	} else if utf8.RuneCountInString(postReq.ContentMD) > MaxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content exceeds 30,000 character limit"})
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
		Format:     postReq.Format,
		AuthorID:   &fan.ID,
		AuthorName: fan.Username,
	}

	id, err := post_repo.Create(&post)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	post.ID = id
	touchParentProject(project_repo, &post)
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
func PutPost(c *gin.Context, post_repo PostRepository, project_repo ProjectToucher) {
	type PutPostReq struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		ContentMD string `json:"content_md"`
		Format    string `json:"format"`
	}

	var putPostReq PutPostReq
	if err := c.ShouldBindJSON(&putPostReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Empty keeps the stored format, like the other fields.
	if putPostReq.Format != "" && !util.ValidFormat(putPostReq.Format) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format must be markdown or html"})
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

	fan := currentFan(c)
	if !canModify(fan, oldPost) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only edit your own posts"})
		return
	}

	// Mutate the loaded row so author, parent and created_at survive the
	// repository's full-row Save.
	oldPost.Name = util.PickOrDefault(putPostReq.Name, oldPost.Name)
	oldPost.ContentMD = util.PickOrDefault(putPostReq.ContentMD, oldPost.ContentMD)
	oldPost.Format = util.PickOrDefault(putPostReq.Format, oldPost.Format)

	// Validate the merged result — the edit may have changed the content, the
	// format, or both. HTML is a raw uploaded document rendered without
	// sanitisation: admin-only, capped by file size. Markdown keeps the
	// editor's character limit.
	if oldPost.Format == util.FormatHTML {
		if !fan.IsAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can post HTML content"})
			return
		}
		if len(oldPost.ContentMD) > util.MaxHTMLBytes {
			c.JSON(http.StatusBadRequest, gin.H{"error": "HTML content exceeds the 1MB limit"})
			return
		}
	} else if utf8.RuneCountInString(oldPost.ContentMD) > MaxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content exceeds 30,000 character limit"})
		return
	}

	updatedPost, err := post_repo.Update(oldPost.ID, oldPost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// An edited thread counts as news on the forum, so it counts for its
	// project too.
	touchParentProject(project_repo, updatedPost)
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
