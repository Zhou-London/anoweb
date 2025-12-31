package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/experience"
	"anonchihaya.co.uk/internal/middlewares"
	"github.com/gin-gonic/gin"
)

func registerExperienceRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string, experiencesRepo experience.ExperienceRepository, sessionRepo *auth.SessionRepository) {
	exp := r.Group(prefix + "/experience")
	exp.Use(auth.OptionalAuthMiddleware(sessionRepo))
	exp.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		exp.POST("/upload-experience-img", func(ctx *gin.Context) {
			experience.UploadExperienceImg(ctx, imgPath, imgURLPrefix)
		})
		exp.GET("", func(ctx *gin.Context) {
			experience.GetAllExperiences(ctx, experiencesRepo)
		})
		exp.GET("/short", func(ctx *gin.Context) {
			experience.GetExperiencesShort(ctx, experiencesRepo)
		})
		exp.GET("/:id", func(ctx *gin.Context) {
			experience.GetExperienceByID(ctx, experiencesRepo)
		})
		exp.PUT("/order", func(ctx *gin.Context) {
			experience.PutExperienceOrder(ctx, experiencesRepo)
		})
		exp.POST("", func(ctx *gin.Context) {
			experience.PostExperience(ctx, experiencesRepo)
		})
		exp.PUT("", func(ctx *gin.Context) {
			experience.PutExperience(ctx, experiencesRepo)
		})
		exp.DELETE("/:id", func(ctx *gin.Context) {
			experience.DeleteExperience(ctx, experiencesRepo)
		})
	}
}
