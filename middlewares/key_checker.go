package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func KeyChecker(expectedKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodPost || c.Request.Method == http.MethodPut || c.Request.Method == http.MethodDelete {
			key := c.PostForm("key")
			if key != expectedKey {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
				return
			}
			return
		}
		c.Next()
	}
}
