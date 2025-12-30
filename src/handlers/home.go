package handlers

import "github.com/gin-gonic/gin"

// GetHomeMsg godoc
// @Summary Home message
// @Tags home
// @Produce json
// @Success 200 {object} MessageResponse
// @Router /home [get]
func GetHomeMsg(c *gin.Context) {
	msg := "This is my personal website."

	c.JSON(200, gin.H{
		"message": msg,
	})
}
