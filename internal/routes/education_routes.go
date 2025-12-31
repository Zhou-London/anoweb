package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/education"
	"anonchihaya.co.uk/internal/middlewares"
	"github.com/gin-gonic/gin"
)

func registerEducationRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, educationsRepo education.EducationRepository, sessionRepo *auth.SessionRepository) {
	educationGroup := r.Group(prefix + "/education")
	educationGroup.Use(auth.OptionalAuthMiddleware(sessionRepo))
	educationGroup.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		educationGroup.POST("/upload-image", func(ctx *gin.Context) {
			education.UploadEducationImg(ctx, imgPath, imgURLPrefix)
		})
		educationGroup.GET("", func(ctx *gin.Context) {
			education.GetEducations(ctx, educationsRepo)
		})
		educationGroup.DELETE("/:id", func(ctx *gin.Context) {
			education.DeleteEducation(ctx, educationsRepo)
		})
		educationGroup.POST("", func(ctx *gin.Context) {
			education.PostEducation(ctx, educationsRepo)
		})
		educationGroup.POST("/image", func(ctx *gin.Context) {
			education.PostEducationImg(ctx, educationsRepo)
		})
		educationGroup.PUT("", func(ctx *gin.Context) {
			education.PutEducation(ctx, educationsRepo)
		})
	}
}
