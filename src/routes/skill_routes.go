package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerSkillRoutes(r *gin.Engine, key string, skillRepo repositories.SkillRepository, sessionRepo *repositories.SessionRepository) {
	skill := r.Group(prefix + "/skill")
	skill.Use(middlewares.OptionalAuthMiddleware(sessionRepo))
	skill.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		skill.GET("", func(ctx *gin.Context) {
			handlers.GetAllSkills(ctx, skillRepo)
		})
		skill.GET("/:id", func(ctx *gin.Context) {
			handlers.GetSkillByID(ctx, skillRepo)
		})
		skill.PUT("/order", func(ctx *gin.Context) {
			handlers.PutSkillOrder(ctx, skillRepo)
		})
		skill.POST("", func(ctx *gin.Context) {
			handlers.PostSkill(ctx, skillRepo)
		})
		skill.PUT("", func(ctx *gin.Context) {
			handlers.PutSkill(ctx, skillRepo)
		})
		skill.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeleteSkill(ctx, skillRepo)
		})
	}
}
