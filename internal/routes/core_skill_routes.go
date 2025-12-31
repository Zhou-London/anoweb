package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/coreskill"
	"anonchihaya.co.uk/internal/middlewares"
	"github.com/gin-gonic/gin"
)

func registerCoreSkillRoutes(r *gin.Engine, key string, coreSkillRepo coreskill.CoreSkillRepository, sessionRepo *auth.SessionRepository) {
	skill := r.Group(prefix + "/core-skill")
	skill.Use(auth.OptionalAuthMiddleware(sessionRepo))
	skill.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		skill.GET("", func(ctx *gin.Context) {
			coreskill.GetCoreSkills(ctx, coreSkillRepo)
		})
		skill.POST("", func(ctx *gin.Context) {
			coreskill.PostCoreSkill(ctx, coreSkillRepo)
		})
		skill.PUT("", func(ctx *gin.Context) {
			coreskill.PutCoreSkill(ctx, coreSkillRepo)
		})
		skill.DELETE("/:id", func(ctx *gin.Context) {
			coreskill.DeleteCoreSkill(ctx, coreSkillRepo)
		})
		skill.POST("/update-order", func(ctx *gin.Context) {
			coreskill.UpdateCoreSkillOrder(ctx, coreSkillRepo)
		})
	}
}
