package static

import (
	"net/http"
	"strconv"
	"time"

	"anonchihaya.co.uk/internal/util"
	"github.com/gin-gonic/gin"
)

// UploadImage godoc
// @Summary Upload image
// @Tags static
// @Accept mpfd
// @Produce plain
// @Param file formData file true "Image file"
// @Success 200 {string} string
// @Failure 400 {string} string
// @Failure 500 {string} string
// @Router /static/upload-image [post]
func UploadImage(c *gin.Context, img_path string, img_url_prefix string) {
	file, err := c.FormFile("file")
	if err != nil {
		c.String(http.StatusBadRequest, "file not found")
		return
	}

	if !util.IsImage(file.Filename) {
		c.String(http.StatusBadRequest, "not an image")
		return
	}

	timestamp := time.Now().UnixMilli()
	filename := "/img-" + strconv.FormatInt(timestamp, 10) + "-" + file.Filename
	if err := c.SaveUploadedFile(file, img_path+filename); err != nil {
		c.String(http.StatusInternalServerError, "save failed: %s", err)
		return
	}

	c.String(http.StatusOK, img_url_prefix+filename)
}
