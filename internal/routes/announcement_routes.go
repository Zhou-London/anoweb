package routes

import (
	"anonchihaya.co.uk/internal/announcement"
	"anonchihaya.co.uk/internal/auth"
	"github.com/gin-gonic/gin"
)

func registerAnnouncementRoutes(r *gin.Engine, repo announcement.AnnouncementRepository, sessionRepo *auth.SessionRepository) {
	// Public routes
	pub := r.Group(prefix + "/announcement")
	{
		pub.GET("", func(c *gin.Context) {
			announcement.GetAllAnnouncements(c, repo)
		})
		pub.GET("/latest", func(c *gin.Context) {
			announcement.GetLatestAnnouncement(c, repo)
		})
	}

	// Admin routes
	admin := r.Group(prefix + "/announcement")
	admin.Use(auth.AuthMiddleware(sessionRepo))
	admin.Use(auth.AdminMiddleware())
	{
		admin.POST("", func(c *gin.Context) {
			announcement.PostAnnouncement(c, repo)
		})
		admin.PUT("", func(c *gin.Context) {
			announcement.PutAnnouncement(c, repo)
		})
		admin.DELETE("/:id", func(c *gin.Context) {
			announcement.DeleteAnnouncement(c, repo)
		})
	}
}
