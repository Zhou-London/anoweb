package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/vbook"
	"github.com/gin-gonic/gin"
)

func registerVBookRoutes(r *gin.Engine, vbookRepo vbook.VBookRepository, progressRepo vbook.VBookProgressRepository, sessionRepo *auth.SessionRepository) {
	pub := r.Group(prefix + "/vbook")
	pub.Use(auth.OptionalAuthMiddleware(sessionRepo))
	{
		pub.GET("", func(c *gin.Context) {
			vbook.GetVBooks(c, vbookRepo)
		})
		pub.GET("/:id", func(c *gin.Context) {
			vbook.GetVBook(c, vbookRepo, progressRepo)
		})
	}

	admin := r.Group(prefix + "/vbook")
	admin.Use(auth.AuthMiddleware(sessionRepo))
	admin.Use(auth.AdminMiddleware())
	{
		admin.POST("", func(c *gin.Context) {
			vbook.CreateVBook(c, vbookRepo)
		})
		admin.PUT("", func(c *gin.Context) {
			vbook.UpdateVBook(c, vbookRepo)
		})
		admin.POST("/update-image-url", func(c *gin.Context) {
			vbook.UpdateVBookImage(c, vbookRepo)
		})
		admin.DELETE("/:id", func(c *gin.Context) {
			vbook.DeleteVBook(c, vbookRepo)
		})
	}

	authed := r.Group(prefix + "/vbook")
	authed.Use(auth.AuthMiddleware(sessionRepo))
	{
		authed.POST("/:id/progress", func(c *gin.Context) {
			vbook.MarkSectionCompleted(c, progressRepo)
		})
		authed.DELETE("/:id/progress", func(c *gin.Context) {
			vbook.ResetVBookProgress(c, progressRepo)
		})
	}
}
