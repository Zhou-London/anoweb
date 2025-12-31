package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/middlewares"
	"anonchihaya.co.uk/internal/static"
	"github.com/gin-gonic/gin"
)

func registerStaticRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, sessionRepo *auth.SessionRepository) {
	staticGroup := r.Group(prefix + "/static")
	staticGroup.Use(auth.OptionalAuthMiddleware(sessionRepo))
	staticGroup.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		staticGroup.POST("/upload-image", func(ctx *gin.Context) {
			static.UploadImage(ctx, imgPath, imgURLPrefix)
		})
	}
}
