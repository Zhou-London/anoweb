package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/home"
	"anonchihaya.co.uk/internal/middlewares"
	"github.com/gin-gonic/gin"
)

func registerHomeRoutes(r *gin.Engine, key string, sessionRepo *auth.SessionRepository) {
	homeGroup := r.Group(prefix + "/home")
	homeGroup.Use(auth.OptionalAuthMiddleware(sessionRepo))
	homeGroup.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		homeGroup.GET("", home.GetHomeMsg)
	}
}
