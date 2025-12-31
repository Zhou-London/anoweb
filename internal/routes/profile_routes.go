package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/middlewares"
	"anonchihaya.co.uk/internal/profile"
	"github.com/gin-gonic/gin"
)

func registerProfileRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, profileRepo profile.ProfileRepository, sessionRepo *auth.SessionRepository) {
	profileGroup := r.Group(prefix + "/profile")
	profileGroup.Use(auth.OptionalAuthMiddleware(sessionRepo))
	profileGroup.Use(func(c *gin.Context) {
		// Check if user is authenticated via new system or old key system
		_, hasUser := c.Get("user")
		if !hasUser {
			// Fall back to key checker for backward compatibility
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		profileGroup.POST("/upload-image", func(ctx *gin.Context) {
			profile.UploadProfileImg(ctx, imgPath, imgURLPrefix)
		})
		profileGroup.GET("", func(ctx *gin.Context) {
			profile.GetProfileInfo(ctx, profileRepo)
		})
		profileGroup.DELETE("", func(ctx *gin.Context) {
			profile.DeleteProfileInfo(ctx, profileRepo)
		})
		profileGroup.POST("", func(ctx *gin.Context) {
			profile.PostProfileInfo(ctx, profileRepo)
		})
		profileGroup.PUT("", func(ctx *gin.Context) {
			profile.PutProfileInfo(ctx, profileRepo)
		})
	}
}
