package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerCoreSkillRoutes(r *gin.Engine, key string, coreSkillRepo repositories.CoreSkillRepository, sessionRepo *repositories.SessionRepository) {
	skill := r.Group(prefix + "/core-skill")
	skill.Use(middlewares.OptionalAuthMiddleware(sessionRepo))
	skill.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		skill.GET("", func(ctx *gin.Context) {
			handlers.GetCoreSkills(ctx, coreSkillRepo)
		})
		skill.POST("", func(ctx *gin.Context) {
			handlers.PostCoreSkill(ctx, coreSkillRepo)
		})
		skill.PUT("", func(ctx *gin.Context) {
			handlers.PutCoreSkill(ctx, coreSkillRepo)
		})
		skill.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeleteCoreSkill(ctx, coreSkillRepo)
		})
		skill.POST("/update-order", func(ctx *gin.Context) {
			handlers.UpdateCoreSkillOrder(ctx, coreSkillRepo)
		})
	}
}
