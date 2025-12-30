package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerFanRoutes(r *gin.Engine, domain, imgPath, imgURLPrefix string, fanRepo *repositories.FanRepository, sessionRepo *repositories.SessionRepository) {
	fanHandler := handlers.NewFanHandler(fanRepo, sessionRepo, domain)
	oauthHandler := handlers.NewOAuthHandler(fanRepo, sessionRepo, domain)

	auth := r.Group(prefix + "/auth")
	{
		auth.POST("/register", fanHandler.Register)
		auth.POST("/login", fanHandler.Login)
		auth.POST("/logout", fanHandler.Logout)
		auth.GET("/me", middlewares.AuthMiddleware(sessionRepo), fanHandler.GetCurrentUser)
		auth.GET("/verify-email", fanHandler.VerifyEmail)
		auth.POST("/resend-verification", fanHandler.ResendVerificationEmail)
		auth.GET("/google", oauthHandler.GoogleLogin)
		auth.GET("/google/callback", oauthHandler.GoogleCallback)
	}

	// Keep existing /api/user/* routes for backward compatibility
	user := r.Group(prefix + "/user")
	user.Use(middlewares.AuthMiddleware(sessionRepo))
	{
		user.GET("/list", fanHandler.GetAllUsers)
		user.PUT("/profile", fanHandler.UpdateProfile)
		user.POST("/profile/photo", func(c *gin.Context) {
			fanHandler.UploadProfilePhoto(c, imgPath, imgURLPrefix)
		})
	}

	// Add new /api/fan/* routes
	fan := r.Group(prefix + "/fan")
	fan.Use(middlewares.AuthMiddleware(sessionRepo))
	{
		fan.GET("/list", fanHandler.GetAllUsers)
		fan.PUT("/profile", fanHandler.UpdateProfile)
		fan.POST("/profile/photo", func(c *gin.Context) {
			fanHandler.UploadProfilePhoto(c, imgPath, imgURLPrefix)
		})
	}
}
