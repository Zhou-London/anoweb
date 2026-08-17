package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/post"
	"anonchihaya.co.uk/internal/project"
	"github.com/gin-gonic/gin"
)

func registerPostRoutes(r *gin.Engine, postsRepo post.PostRepository, projectsRepo project.ProjectRepository, sessionRepo *auth.SessionRepository) {
	// Reads are public.
	postGroup := r.Group(prefix + "/post")
	{
		postGroup.GET("", func(ctx *gin.Context) {
			post.GetPosts(ctx, postsRepo)
		})
		postGroup.GET("/latest", func(ctx *gin.Context) {
			post.GetPostLatest(ctx, postsRepo)
		})
		postGroup.GET("/project/:id", func(ctx *gin.Context) {
			post.GetPostsShort(ctx, postsRepo)
		})
		postGroup.GET("/:id", func(ctx *gin.Context) {
			post.GetPost(ctx, postsRepo)
		})
	}

	// Writes require a session: any fan may create; edits and deletes are
	// checked in the handlers (author or admin only).
	postWrite := r.Group(prefix + "/post")
	postWrite.Use(auth.AuthMiddleware(sessionRepo))
	{
		postWrite.POST("", func(ctx *gin.Context) {
			post.PostPost(ctx, postsRepo, projectsRepo)
		})
		postWrite.PUT("", func(ctx *gin.Context) {
			post.PutPost(ctx, postsRepo, projectsRepo)
		})
		postWrite.DELETE("/:id", func(ctx *gin.Context) {
			post.DeletePost(ctx, postsRepo)
		})
	}
}
