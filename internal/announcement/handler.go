package announcement

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAllAnnouncements(c *gin.Context, repo AnnouncementRepository) {
	announcements, err := repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"announcements": announcements})
}

func GetLatestAnnouncement(c *gin.Context, repo AnnouncementRepository) {
	a, err := repo.GetLatest()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "No announcements found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"announcement": a})
}

func PostAnnouncement(c *gin.Context, repo AnnouncementRepository) {
	type CreateRequest struct {
		Title     string `json:"title"`
		ContentMD string `json:"content_md"`
		ImageURL  string `json:"image_url"`
	}

	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	a := Announcement{
		Title:     req.Title,
		ContentMD: req.ContentMD,
		ImageURL:  req.ImageURL,
	}

	id, err := repo.Create(&a)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	a.ID = id
	c.JSON(http.StatusCreated, gin.H{"announcement": a})
}

func PutAnnouncement(c *gin.Context, repo AnnouncementRepository) {
	type UpdateRequest struct {
		ID        int     `json:"id"`
		Title     *string `json:"title"`
		ContentMD *string `json:"content_md"`
		ImageURL  *string `json:"image_url"`
	}

	var req UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	old, err := repo.GetByID(req.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	if old == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Announcement does not exist"})
		return
	}

	a := *old
	if req.Title != nil {
		a.Title = *req.Title
	}
	if req.ContentMD != nil {
		a.ContentMD = *req.ContentMD
	}
	if req.ImageURL != nil {
		a.ImageURL = *req.ImageURL
	}

	_, err = repo.Update(a.ID, &a)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"announcement": a})
}

func DeleteAnnouncement(c *gin.Context, repo AnnouncementRepository) {
	id := c.Param("id")
	aid, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid announcement ID"})
		return
	}

	if err := repo.Delete(aid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Announcement deleted successfully"})
}
