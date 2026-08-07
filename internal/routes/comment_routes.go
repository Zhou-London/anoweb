package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/comment"
	"anonchihaya.co.uk/internal/post"
	"github.com/gin-gonic/gin"
)

func registerCommentRoutes(r *gin.Engine, commentRepo comment.CommentRepository, postsRepo post.PostRepository, sessionRepo *auth.SessionRepository) {
	// Public read; optional auth fills in has_liked.
	commentGroup := r.Group(prefix + "/comment")
	commentGroup.Use(auth.OptionalAuthMiddleware(sessionRepo))
	{
		commentGroup.GET("/post/:id", func(ctx *gin.Context) {
			comment.GetCommentsByPost(ctx, commentRepo)
		})
	}

	// Writes require a session; delete is author-or-admin (checked in handler).
	commentWrite := r.Group(prefix + "/comment")
	commentWrite.Use(auth.AuthMiddleware(sessionRepo))
	{
		commentWrite.POST("", func(ctx *gin.Context) {
			comment.PostComment(ctx, commentRepo, postsRepo)
		})
		commentWrite.POST("/:id/like", func(ctx *gin.Context) {
			comment.ToggleCommentLike(ctx, commentRepo)
		})
		commentWrite.DELETE("/:id", func(ctx *gin.Context) {
			comment.DeleteComment(ctx, commentRepo)
		})
	}
}
