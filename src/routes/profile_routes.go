package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerProfileRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, profileRepo repositories.ProfileRepository) {
	profile := r.Group(prefix + "/profile")
	profile.Use(middlewares.KeyChecker(key))
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
