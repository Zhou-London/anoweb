package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerStaticRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, sessionRepo *repositories.SessionRepository) {
	static := r.Group(prefix + "/static")
	static.Use(middlewares.OptionalAuthMiddleware(sessionRepo))
	static.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		static.POST("/upload-image", func(ctx *gin.Context) {
			handlers.UploadImage(ctx, imgPath, imgURLPrefix)
		})
	}
}
