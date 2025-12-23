package handlers

import "github.com/gin-gonic/gin"

func GetHomeMsg(c *gin.Context) {
	msg := "This is my personal website."

	c.JSON(200, gin.H{
		"message": msg,
	})
}
