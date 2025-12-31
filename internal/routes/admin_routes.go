package routes

import (
	"anonchihaya.co.uk/internal/admin"
	"github.com/gin-gonic/gin"
)

func registerAdminRoutes(r *gin.Engine, domain, adminPass, key string) {
	adminGroup := r.Group(prefix + "/admin")
	{
		adminGroup.POST("", func(ctx *gin.Context) {
			admin.PostAdminCheck(ctx, domain, adminPass, key)
		})
		adminGroup.GET("/status", func(ctx *gin.Context) {
			admin.GetStatusCheck(ctx, key)
		})
		adminGroup.POST("/logout", func(ctx *gin.Context) {
			admin.PostAdminLogout(ctx, domain)
		})
	}
}
