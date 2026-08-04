package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/profile"
	"github.com/gin-gonic/gin"
)

func registerProfileRoutes(r *gin.Engine, imgPath, imgURLPrefix string, profileRepo profile.ProfileRepository, sessionRepo *auth.SessionRepository) {
	// Public reads.
	profileGroup := r.Group(prefix + "/profile")
	{
		profileGroup.GET("", func(ctx *gin.Context) {
			profile.GetProfileInfo(ctx, profileRepo)
		})
	}

	// Owner content: writes are admin-only.
	profileAdmin := r.Group(prefix + "/profile")
	profileAdmin.Use(auth.AuthMiddleware(sessionRepo))
	profileAdmin.Use(auth.AdminMiddleware())
	{
		profileAdmin.POST("", func(ctx *gin.Context) {
			profile.PostProfileInfo(ctx, profileRepo)
		})
		profileAdmin.PUT("", func(ctx *gin.Context) {
			profile.PutProfileInfo(ctx, profileRepo)
		})
		profileAdmin.DELETE("", func(ctx *gin.Context) {
			profile.DeleteProfileInfo(ctx, profileRepo)
		})
		profileAdmin.POST("/upload-image", func(ctx *gin.Context) {
			profile.UploadProfileImg(ctx, imgPath, imgURLPrefix)
		})
	}
}
