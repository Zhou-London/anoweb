package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/project"
	"github.com/gin-gonic/gin"
)

func registerProjectRoutes(r *gin.Engine, projectsRepo project.ProjectRepository, sessionRepo *auth.SessionRepository) {
	// Public reads.
	proj := r.Group(prefix + "/project")
	{
		proj.GET("", func(ctx *gin.Context) {
			project.GetProjects(ctx, projectsRepo)
		})
	}

	// Owner content: writes are admin-only.
	projAdmin := r.Group(prefix + "/project")
	projAdmin.Use(auth.AuthMiddleware(sessionRepo))
	projAdmin.Use(auth.AdminMiddleware())
	{
		projAdmin.POST("", func(ctx *gin.Context) {
			project.PostProject(ctx, projectsRepo)
		})
		projAdmin.POST("/update-image-url", func(ctx *gin.Context) {
			project.PostProjectImg(ctx, projectsRepo)
		})
		projAdmin.PUT("", func(ctx *gin.Context) {
			project.PutProject(ctx, projectsRepo)
		})
		projAdmin.DELETE("/:id", func(ctx *gin.Context) {
			project.DeleteProject(ctx, projectsRepo)
		})
	}
}
