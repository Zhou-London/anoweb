package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/coreskill"
	"github.com/gin-gonic/gin"
)

func registerCoreSkillRoutes(r *gin.Engine, coreSkillRepo coreskill.CoreSkillRepository, sessionRepo *auth.SessionRepository) {
	// Public reads.
	skill := r.Group(prefix + "/core-skill")
	{
		skill.GET("", func(ctx *gin.Context) {
			coreskill.GetCoreSkills(ctx, coreSkillRepo)
		})
	}

	// Owner content: writes are admin-only.
	skillAdmin := r.Group(prefix + "/core-skill")
	skillAdmin.Use(auth.AuthMiddleware(sessionRepo))
	skillAdmin.Use(auth.AdminMiddleware())
	{
		skillAdmin.POST("", func(ctx *gin.Context) {
			coreskill.PostCoreSkill(ctx, coreSkillRepo)
		})
		skillAdmin.PUT("", func(ctx *gin.Context) {
			coreskill.PutCoreSkill(ctx, coreSkillRepo)
		})
		skillAdmin.DELETE("/:id", func(ctx *gin.Context) {
			coreskill.DeleteCoreSkill(ctx, coreSkillRepo)
		})
		skillAdmin.POST("/update-order", func(ctx *gin.Context) {
			coreskill.UpdateCoreSkillOrder(ctx, coreSkillRepo)
		})
	}
}
