package middlewares

import (
	"net/http"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware checks if the user is authenticated
func AuthMiddleware(sessionRepo *repositories.SessionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("session_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			c.Abort()
			return
		}

		session, err := sessionRepo.FindByToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
			c.Abort()
			return
		}

		// Set fan in context (keeping key as "user" for backward compatibility)
		c.Set("user", &session.Fan)
		c.Next()
	}
}

// AdminMiddleware checks if the authenticated fan is an admin
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		fan, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			c.Abort()
			return
		}

		// Type assertion to get fan model
		fanModel, ok := fan.(*models.Fan)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid fan context"})
			c.Abort()
			return
		}

		// Check if fan is admin
		if !fanModel.IsAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// OptionalAuthMiddleware sets fan in context if authenticated, but doesn't require it
func OptionalAuthMiddleware(sessionRepo *repositories.SessionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("session_token")
		if err == nil {
			session, err := sessionRepo.FindByToken(token)
			if err == nil {
				c.Set("user", &session.Fan)
			}
		}
		c.Next()
	}
}
