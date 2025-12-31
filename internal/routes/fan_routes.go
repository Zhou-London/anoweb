package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"github.com/gin-gonic/gin"
)

func registerFanRoutes(r *gin.Engine, domain, imgPath, imgURLPrefix string, fanRepo *auth.FanRepository, sessionRepo *auth.SessionRepository) {
	fanHandler := auth.NewFanHandler(fanRepo, sessionRepo, domain)
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
	}

	// Keep existing /api/user/* routes for backward compatibility
	user := r.Group(prefix + "/user")
	user.Use(auth.AuthMiddleware(sessionRepo))
	{
		user.GET("/list", fanHandler.GetAllUsers)
		user.PUT("/profile", fanHandler.UpdateProfile)
		user.POST("/profile/photo", func(c *gin.Context) {
			fanHandler.UploadProfilePhoto(c, imgPath, imgURLPrefix)
		})
	}

	// Add new /api/fan/* routes
	fan := r.Group(prefix + "/fan")
	fan.Use(auth.AuthMiddleware(sessionRepo))
	{
		fan.GET("/list", fanHandler.GetAllUsers)
		fan.PUT("/profile", fanHandler.UpdateProfile)
		fan.POST("/profile/photo", func(c *gin.Context) {
			fanHandler.UploadProfilePhoto(c, imgPath, imgURLPrefix)
		})
	}
}
