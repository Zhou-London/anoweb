package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/experience"
	"github.com/gin-gonic/gin"
)

func registerExperienceRoutes(r *gin.Engine, imgPath, imgURLPrefix string, experiencesRepo experience.ExperienceRepository, sessionRepo *auth.SessionRepository) {
	// Public reads.
	exp := r.Group(prefix + "/experience")
	{
		exp.GET("", func(ctx *gin.Context) {
			experience.GetAllExperiences(ctx, experiencesRepo)
		})
		exp.GET("/short", func(ctx *gin.Context) {
			experience.GetExperiencesShort(ctx, experiencesRepo)
		})
		exp.GET("/:id", func(ctx *gin.Context) {
			experience.GetExperienceByID(ctx, experiencesRepo)
		})
	}

	// Owner content: writes are admin-only.
	expAdmin := r.Group(prefix + "/experience")
	expAdmin.Use(auth.AuthMiddleware(sessionRepo))
	expAdmin.Use(auth.AdminMiddleware())
	{
		expAdmin.POST("", func(ctx *gin.Context) {
			experience.PostExperience(ctx, experiencesRepo)
		})
		expAdmin.PUT("", func(ctx *gin.Context) {
			experience.PutExperience(ctx, experiencesRepo)
		})
		expAdmin.PUT("/order", func(ctx *gin.Context) {
			experience.PutExperienceOrder(ctx, experiencesRepo)
		})
		expAdmin.DELETE("/:id", func(ctx *gin.Context) {
			experience.DeleteExperience(ctx, experiencesRepo)
		})
		expAdmin.POST("/upload-experience-img", func(ctx *gin.Context) {
			experience.UploadExperienceImg(ctx, imgPath, imgURLPrefix)
		})
	}
}
