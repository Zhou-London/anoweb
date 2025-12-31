package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/middlewares"
	"anonchihaya.co.uk/internal/project"
	"github.com/gin-gonic/gin"
)

func registerProjectRoutes(r *gin.Engine, key string, projectsRepo project.ProjectRepository, sessionRepo *auth.SessionRepository) {
	proj := r.Group(prefix + "/project")
	proj.Use(auth.OptionalAuthMiddleware(sessionRepo))
	proj.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		proj.GET("", func(ctx *gin.Context) {
			project.GetProjects(ctx, projectsRepo)
		})
		proj.POST("", func(ctx *gin.Context) {
			project.PostProject(ctx, projectsRepo)
		})
		proj.POST("/update-image-url", func(ctx *gin.Context) {
			project.PostProjectImg(ctx, projectsRepo)
		})
		proj.PUT("", func(ctx *gin.Context) {
			project.PutProject(ctx, projectsRepo)
		})
		proj.DELETE("/:id", func(ctx *gin.Context) {
			project.DeleteProject(ctx, projectsRepo)
		})
	}
}
