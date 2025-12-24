package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerExperienceRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, experiencesRepo repositories.ExperienceRepository) {
	exp := r.Group(prefix + "/experience")
	exp.Use(middlewares.KeyChecker(key))
	{
		exp.POST("/upload-experience-img", func(ctx *gin.Context) {
			handlers.UploadExperienceImg(ctx, imgPath, imgURLPrefix)
		})
		exp.GET("", func(ctx *gin.Context) {
			handlers.GetAllExperiences(ctx, experiencesRepo)
		})
		exp.GET("/short", func(ctx *gin.Context) {
			handlers.GetExperiencesShort(ctx, experiencesRepo)
		})
		exp.GET("/:id", func(ctx *gin.Context) {
			handlers.GetExperienceByID(ctx, experiencesRepo)
		})
		exp.PUT("/order", func(ctx *gin.Context) {
			handlers.PutExperienceOrder(ctx, experiencesRepo)
		})
		exp.POST("", func(ctx *gin.Context) {
			handlers.PostExperience(ctx, experiencesRepo)
		})
		exp.PUT("", func(ctx *gin.Context) {
			handlers.PutExperience(ctx, experiencesRepo)
		})
		exp.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeleteExperience(ctx, experiencesRepo)
		})
	}
}
