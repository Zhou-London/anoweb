package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/blog"
	"anonchihaya.co.uk/internal/tracking"
	"github.com/gin-gonic/gin"
)

func registerFanRoutes(r *gin.Engine, domain, imgPath, imgURLPrefix string, fanRepo *auth.FanRepository, sessionRepo *auth.SessionRepository, trackingRepo *tracking.FanTrackingRepository, blogLikeRepo blog.BlogLikeRepository) {
	fanHandler := auth.NewFanHandler(fanRepo, sessionRepo, domain)
	fanHandler.SetDeleters(trackingRepo, blogLikeRepo)
	oauthHandler := auth.NewOAuthHandler(fanRepo, sessionRepo, domain)

	authGroup := r.Group(prefix + "/auth")
	{
		authGroup.POST("/register", fanHandler.Register)
		authGroup.POST("/login", fanHandler.Login)
		authGroup.POST("/logout", fanHandler.Logout)
		authGroup.GET("/me", auth.AuthMiddleware(sessionRepo), fanHandler.GetCurrentUser)
		authGroup.GET("/verify-email", fanHandler.VerifyEmail)
		authGroup.POST("/resend-verification", fanHandler.ResendVerificationEmail)
		authGroup.GET("/google", oauthHandler.GoogleLogin)
		authGroup.GET("/google/callback", oauthHandler.GoogleCallback)
		authGroup.DELETE("/delete-account", auth.AuthMiddleware(sessionRepo), fanHandler.DeleteAccount)
	}

	// Public user routes (no auth required)
	userPublic := r.Group(prefix + "/user")
	{
		userPublic.GET("/list", fanHandler.GetAllUsers)
	}

	// Authenticated user routes
	user := r.Group(prefix + "/user")
	user.Use(auth.AuthMiddleware(sessionRepo))
	{
		user.PUT("/profile", fanHandler.UpdateProfile)
		user.POST("/profile/photo", func(c *gin.Context) {
			fanHandler.UploadProfilePhoto(c, imgPath, imgURLPrefix)
		})
	}

	// Public fan routes (no auth required)
	fanPublic := r.Group(prefix + "/fan")
	{
		fanPublic.GET("/list", fanHandler.GetAllUsers)
	}

	// Authenticated fan routes
	fan := r.Group(prefix + "/fan")
	fan.Use(auth.AuthMiddleware(sessionRepo))
	{
		fan.PUT("/profile", fanHandler.UpdateProfile)
		fan.POST("/profile/photo", func(c *gin.Context) {
			fanHandler.UploadProfilePhoto(c, imgPath, imgURLPrefix)
		})
	}
}
