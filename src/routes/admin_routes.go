package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"github.com/gin-gonic/gin"
)

func registerAdminRoutes(r *gin.Engine, domain, adminPass, key string) {
	admin := r.Group(prefix + "/admin")
	{
		admin.POST("", func(ctx *gin.Context) {
			handlers.PostAdminCheck(ctx, domain, adminPass, key)
		})
		admin.GET("/status", func(ctx *gin.Context) {
			handlers.GetStatusCheck(ctx, key)
		})
		admin.POST("/logout", func(ctx *gin.Context) {
			handlers.PostAdminLogout(ctx, domain)
		})
	}
}
