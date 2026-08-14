package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/static"
	"github.com/gin-gonic/gin"
)

func registerStaticRoutes(r *gin.Engine, imgPath, imgURLPrefix string, sessionRepo *auth.SessionRepository) {
	// Generic image upload feeds the admin content editors and forum post
	// editors — any signed-in fan (oversized resolutions are downscaled on save).
	staticGroup := r.Group(prefix + "/static")
	staticGroup.Use(auth.AuthMiddleware(sessionRepo))
	{
		staticGroup.POST("/upload-image", func(ctx *gin.Context) {
			static.UploadImage(ctx, imgPath, imgURLPrefix)
		})
	}
}
