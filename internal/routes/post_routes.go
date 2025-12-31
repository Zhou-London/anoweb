package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/middlewares"
	"anonchihaya.co.uk/internal/post"
	"github.com/gin-gonic/gin"
)

func registerPostRoutes(r *gin.Engine, key string, postsRepo post.PostRepository, sessionRepo *auth.SessionRepository) {
	postGroup := r.Group(prefix + "/post")
	postGroup.Use(auth.OptionalAuthMiddleware(sessionRepo))
	postGroup.Use(func(c *gin.Context) {
		_, hasUser := c.Get("user")
		if !hasUser {
			middlewares.KeyChecker(key)(c)
		}
	})
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
		postGroup.POST("", func(ctx *gin.Context) {
			post.PostPost(ctx, postsRepo)
		})
		postGroup.PUT("", func(ctx *gin.Context) {
			post.PutPost(ctx, postsRepo)
		})
		postGroup.DELETE("/:id", func(ctx *gin.Context) {
			post.DeletePost(ctx, postsRepo)
		})
	}
}
