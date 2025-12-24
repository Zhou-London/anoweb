package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerPostRoutes(r *gin.Engine, key string, postsRepo repositories.PostRepository, sessionRepo *repositories.SessionRepository) {
	post := r.Group(prefix + "/post")
	post.Use(middlewares.OptionalAuthMiddleware(sessionRepo))
	post.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
	{
		post.GET("/latest", func(ctx *gin.Context) {
			handlers.GetPostLatest(ctx, postsRepo)
		})
		post.GET("/project/:id", func(ctx *gin.Context) {
			handlers.GetPostsShort(ctx, postsRepo)
		})
		post.GET("/:id", func(ctx *gin.Context) {
			handlers.GetPost(ctx, postsRepo)
		})
		post.POST("", func(ctx *gin.Context) {
			handlers.PostPost(ctx, postsRepo)
		})
		post.PUT("", func(ctx *gin.Context) {
			handlers.PutPost(ctx, postsRepo)
		})
		post.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeletePost(ctx, postsRepo)
		})
	}
}
