package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/education"
	"github.com/gin-gonic/gin"
)

func registerEducationRoutes(r *gin.Engine, imgPath, imgURLPrefix string, educationsRepo education.EducationRepository, sessionRepo *auth.SessionRepository) {
	// Public reads.
	educationGroup := r.Group(prefix + "/education")
	{
		educationGroup.GET("", func(ctx *gin.Context) {
			education.GetEducations(ctx, educationsRepo)
		})
	}

	// Owner content: writes are admin-only.
	educationAdmin := r.Group(prefix + "/education")
	educationAdmin.Use(auth.AuthMiddleware(sessionRepo))
	educationAdmin.Use(auth.AdminMiddleware())
	{
		educationAdmin.POST("", func(ctx *gin.Context) {
			education.PostEducation(ctx, educationsRepo)
		})
		educationAdmin.PUT("", func(ctx *gin.Context) {
			education.PutEducation(ctx, educationsRepo)
		})
		educationAdmin.DELETE("/:id", func(ctx *gin.Context) {
			education.DeleteEducation(ctx, educationsRepo)
		})
		educationAdmin.POST("/image", func(ctx *gin.Context) {
			education.PostEducationImg(ctx, educationsRepo)
		})
		educationAdmin.POST("/upload-image", func(ctx *gin.Context) {
			education.UploadEducationImg(ctx, imgPath, imgURLPrefix)
		})
	}
}
