package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/blog"
	"github.com/gin-gonic/gin"
)

func registerBlogRoutes(r *gin.Engine, blogRepo blog.BlogRepository, blogLikeRepo blog.BlogLikeRepository, sessionRepo *auth.SessionRepository) {
	blogGroup := r.Group(prefix + "/blog")
	blogGroup.Use(auth.OptionalAuthMiddleware(sessionRepo))

	// Public routes (with optional auth for like status)
	{
		blogGroup.GET("", func(ctx *gin.Context) {
			blog.GetBlogs(ctx, blogRepo)
		})
		blogGroup.GET("/recent", func(ctx *gin.Context) {
			blog.GetRecentBlogs(ctx, blogRepo)
		})
		blogGroup.GET("/:id", func(ctx *gin.Context) {
			blog.GetBlog(ctx, blogRepo, blogLikeRepo)
		})
		blogGroup.POST("/:id/view", func(ctx *gin.Context) {
			blog.IncrementView(ctx, blogRepo)
		})
	}

	// Admin routes
	adminBlog := r.Group(prefix + "/blog")
	adminBlog.Use(auth.AuthMiddleware(sessionRepo))
	adminBlog.Use(auth.AdminMiddleware())
	{
		adminBlog.POST("", func(ctx *gin.Context) {
			blog.CreateBlog(ctx, blogRepo)
		})
		adminBlog.PUT("", func(ctx *gin.Context) {
			blog.UpdateBlog(ctx, blogRepo)
		})
		adminBlog.DELETE("/:id", func(ctx *gin.Context) {
			blog.DeleteBlog(ctx, blogRepo)
		})
		adminBlog.POST("/update-image-url", func(ctx *gin.Context) {
			blog.UpdateBlogImage(ctx, blogRepo)
		})
	}

	// Authenticated fan routes (for likes)
	authBlog := r.Group(prefix + "/blog")
	authBlog.Use(auth.AuthMiddleware(sessionRepo))
	{
		authBlog.POST("/:id/like", func(ctx *gin.Context) {
			blog.ToggleLike(ctx, blogRepo, blogLikeRepo)
		})
	}
}
