package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/resume"
	"github.com/gin-gonic/gin"
)

// Both routes are public — the CV itself is a public link. Auth is optional
// so the owner's own downloads can be told apart and left uncounted.
func registerResumeRoutes(r *gin.Engine, resumeRepo resume.Repository, sessionRepo *auth.SessionRepository) {
	resumeGroup := r.Group(prefix + "/resume")
	resumeGroup.Use(auth.OptionalAuthMiddleware(sessionRepo))
	{
		resumeGroup.GET("/downloads", func(ctx *gin.Context) {
			resume.GetDownloads(ctx, resumeRepo)
		})
		resumeGroup.POST("/download", func(ctx *gin.Context) {
			resume.RecordDownload(ctx, resumeRepo)
		})
	}
}
