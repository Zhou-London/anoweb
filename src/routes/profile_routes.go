package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerProfileRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, profileRepo repositories.ProfileRepository, sessionRepo *repositories.SessionRepository) {
	profile := r.Group(prefix + "/profile")
	profile.Use(middlewares.OptionalAuthMiddleware(sessionRepo))
	profile.Use(func(c *gin.Context) {
		// Check if user is authenticated via new system or old key system
		_, hasUser := c.Get("user")
		if !hasUser {
			// Fall back to key checker for backward compatibility
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		profile.POST("/upload-image", func(ctx *gin.Context) {
			handlers.UploadProfileImg(ctx, imgPath, imgURLPrefix)
		})
		profile.GET("", func(ctx *gin.Context) {
			handlers.GetProfileInfo(ctx, profileRepo)
		})
		profile.DELETE("", func(ctx *gin.Context) {
			handlers.DeleteProfileInfo(ctx, profileRepo)
		})
		profile.POST("", func(ctx *gin.Context) {
			handlers.PostProfileInfo(ctx, profileRepo)
		})
		profile.PUT("", func(ctx *gin.Context) {
			handlers.PutProfileInfo(ctx, profileRepo)
		})
	}
}
