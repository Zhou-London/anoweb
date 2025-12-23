package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerEducationRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, educationsRepo repositories.EducationRepository) {
	education := r.Group(prefix + "/education")
	education.Use(middlewares.KeyChecker(key))
	{
		education.POST("/upload-image", func(ctx *gin.Context) {
			handlers.UploadEducationImg(ctx, imgPath, imgURLPrefix)
		})
		education.GET("", func(ctx *gin.Context) {
			handlers.GetEducations(ctx, educationsRepo)
		})
		education.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeleteEducation(ctx, educationsRepo)
		})
		education.POST("", func(ctx *gin.Context) {
			handlers.PostEducation(ctx, educationsRepo)
		})
		education.POST("/image", func(ctx *gin.Context) {
			handlers.PostEducationImg(ctx, educationsRepo)
		})
		education.PUT("", func(ctx *gin.Context) {
			handlers.PutEducation(ctx, educationsRepo)
		})
	}
}
