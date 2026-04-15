package vbook

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/util"
	"github.com/gin-gonic/gin"
)

// GetVBooks godoc
// @Summary List all vBooks
// @Tags vbook
// @Produce json
// @Success 200 {array} VBookShort
// @Failure 500 {object} ErrorResponse
// @Router /vbook [get]
func GetVBooks(c *gin.Context, vbookRepo VBookRepository) {
	rows, err := vbookRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, rows)
}

// GetVBook godoc
// @Summary Get single vBook with progress for the current user
// @Tags vbook
// @Produce json
// @Param id path int true "VBook ID"
// @Success 200 {object} VBookWithProgress
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /vbook/{id} [get]
func GetVBook(c *gin.Context, vbookRepo VBookRepository, progressRepo VBookProgressRepository) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vBook ID"})
		return
	}

	vb, err := vbookRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "vBook not found"})
		return
	}

	resp := VBookWithProgress{VBook: *vb, Progress: []ChapterProgress{}}

	if user, exists := c.Get("user"); exists {
		if fan, ok := user.(*auth.Fan); ok && fan != nil {
			rows, err := progressRepo.GetForFanVBook(fan.ID, id)
			if err == nil {
				resp.Progress = aggregateProgress(rows)
			}
		}
	}

	c.JSON(http.StatusOK, resp)
}

// aggregateProgress groups progress rows by chapter id, preserving insertion order.
func aggregateProgress(rows []*VBookProgress) []ChapterProgress {
	idx := map[string]int{}
	out := make([]ChapterProgress, 0, len(rows))
	for _, r := range rows {
		i, ok := idx[r.ChapterID]
		if !ok {
			idx[r.ChapterID] = len(out)
			out = append(out, ChapterProgress{
				ChapterID:        r.ChapterID,
				CompletedCount:   1,
				CompletedSection: []string{r.SectionID},
			})
			continue
		}
		out[i].CompletedCount++
		out[i].CompletedSection = append(out[i].CompletedSection, r.SectionID)
	}
	return out
}

// CreateVBook godoc
// @Summary Create a new vBook
// @Tags vbook
// @Accept json
// @Produce json
// @Success 201 {object} VBook
// @Router /vbook [post]
func CreateVBook(c *gin.Context, vbookRepo VBookRepository) {
	type req struct {
		Slug          string `json:"slug" binding:"required"`
		Title         string `json:"title" binding:"required"`
		Description   string `json:"description"`
		CoverImageURL string `json:"cover_image_url"`
		OrderIndex    int    `json:"order_index"`
	}
	var body req
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vb := VBook{
		Slug:          body.Slug,
		Title:         body.Title,
		Description:   body.Description,
		CoverImageURL: body.CoverImageURL,
		OrderIndex:    body.OrderIndex,
	}
	id, err := vbookRepo.Create(&vb)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	vb.ID = id
	c.JSON(http.StatusCreated, vb)
}

// UpdateVBook godoc
// @Summary Update a vBook (admin)
// @Tags vbook
// @Accept json
// @Produce json
// @Success 200 {object} VBook
// @Router /vbook [put]
func UpdateVBook(c *gin.Context, vbookRepo VBookRepository) {
	type req struct {
		ID            int    `json:"id" binding:"required"`
		Title         string `json:"title"`
		Description   string `json:"description"`
		CoverImageURL string `json:"cover_image_url"`
		OrderIndex    *int   `json:"order_index"`
	}
	var body req
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	old, err := vbookRepo.GetByID(body.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "vBook not found"})
		return
	}
	updated := VBook{
		ID:            old.ID,
		Slug:          old.Slug,
		Title:         util.PickOrDefault(body.Title, old.Title),
		Description:   util.PickOrDefault(body.Description, old.Description),
		CoverImageURL: util.PickOrDefault(body.CoverImageURL, old.CoverImageURL),
		OrderIndex:    old.OrderIndex,
		CreatedAt:     old.CreatedAt,
	}
	if body.OrderIndex != nil {
		updated.OrderIndex = *body.OrderIndex
	}
	saved, err := vbookRepo.Update(updated.ID, &updated)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, saved)
}

// UpdateVBookImage godoc
// @Summary Update a vBook cover image (admin)
// @Tags vbook
// @Accept json
// @Produce json
// @Success 200 {object} VBook
// @Router /vbook/update-image-url [post]
func UpdateVBookImage(c *gin.Context, vbookRepo VBookRepository) {
	type req struct {
		ID       int    `json:"id" binding:"required"`
		ImageURL string `json:"image_url" binding:"required"`
	}
	var body req
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	vb, err := vbookRepo.UpdateImageURL(body.ID, body.ImageURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, vb)
}

// DeleteVBook godoc
// @Summary Delete a vBook (admin)
// @Tags vbook
// @Produce json
// @Param id path int true "VBook ID"
// @Success 200 {object} MessageResponse
// @Router /vbook/{id} [delete]
func DeleteVBook(c *gin.Context, vbookRepo VBookRepository) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vBook ID"})
		return
	}
	if err := vbookRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "vBook deleted successfully"})
}

// MarkSectionCompleted godoc
// @Summary Mark a chapter section as completed for the current fan
// @Tags vbook
// @Accept json
// @Produce json
// @Param id path int true "VBook ID"
// @Success 200 {object} MessageResponse
// @Router /vbook/{id}/progress [post]
func MarkSectionCompleted(c *gin.Context, progressRepo VBookProgressRepository) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vBook ID"})
		return
	}
	type req struct {
		ChapterID string `json:"chapter_id" binding:"required"`
		SectionID string `json:"section_id" binding:"required"`
	}
	var body req
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
	if err := progressRepo.MarkCompleted(fan.ID, id, body.ChapterID, body.SectionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	rows, err := progressRepo.GetForFanVBook(fan.ID, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ok", "progress": aggregateProgress(rows)})
}

// ResetVBookProgress godoc
// @Summary Reset all progress for a vBook for the current fan
// @Tags vbook
// @Produce json
// @Param id path int true "VBook ID"
// @Success 200 {object} MessageResponse
// @Router /vbook/{id}/progress [delete]
func ResetVBookProgress(c *gin.Context, progressRepo VBookProgressRepository) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vBook ID"})
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
	if err := progressRepo.ResetForVBook(fan.ID, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Progress reset"})
}
