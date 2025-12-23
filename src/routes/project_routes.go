package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerProjectRoutes(r *gin.Engine, key string, projectsRepo repositories.ProjectRepository) {
	proj := r.Group(prefix + "/project")
	proj.Use(middlewares.KeyChecker(key))
	{
		proj.GET("", func(ctx *gin.Context) {
			handlers.GetProjects(ctx, projectsRepo)
		})
		proj.POST("", func(ctx *gin.Context) {
			handlers.PostProject(ctx, projectsRepo)
		})
		proj.POST("/update-image-url", func(ctx *gin.Context) {
			handlers.PostProjectImg(ctx, projectsRepo)
		})
		proj.PUT("", func(ctx *gin.Context) {
			handlers.PutProject(ctx, projectsRepo)
		})
		proj.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeleteProject(ctx, projectsRepo)
		})
	}
}
