package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerHomeRoutes(r *gin.Engine, key string, sessionRepo *repositories.SessionRepository) {
	home := r.Group(prefix + "/home")
	home.Use(middlewares.OptionalAuthMiddleware(sessionRepo))
	home.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		home.GET("", handlers.GetHomeMsg)
	}
}
