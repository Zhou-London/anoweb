package resume

import (
	"net/http"

	"anonchihaya.co.uk/internal/auth"
	"github.com/gin-gonic/gin"
)

// GetDownloads godoc
// @Summary CV download count
// @Tags resume
// @Produce json
// @Success 200 {object} ResumeDownloadsResponse
// @Failure 500 {object} ErrorResponse
// @Router /resume/downloads [get]
func GetDownloads(c *gin.Context, repo Repository) {
	n, err := repo.Downloads()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get download count"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"downloads": n})
}

// RecordDownload godoc
// @Summary Record a CV download
// @Description Counts one download and answers with the new total. The owner's own downloads are not counted.
// @Tags resume
// @Produce json
// @Success 200 {object} ResumeDownloadsResponse
// @Failure 500 {object} ErrorResponse
// @Router /resume/download [post]
func RecordDownload(c *gin.Context, repo Repository) {
	// The admin's own downloads don't count, same as blog views.
	if user, exists := c.Get("user"); exists {
		if fan, ok := user.(*auth.Fan); ok && fan != nil && fan.IsAdmin {
			GetDownloads(c, repo)
			return
		}
	}

	n, err := repo.IncrementDownloads()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record download"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"downloads": n})
}
