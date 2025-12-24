package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerUserRoutes(r *gin.Engine, domain, imgPath, imgURLPrefix string, userRepo *repositories.UserRepository, sessionRepo *repositories.SessionRepository) {
	userHandler := handlers.NewUserHandler(userRepo, sessionRepo, domain)

	auth := r.Group(prefix + "/auth")
	{
		auth.POST("/register", userHandler.Register)
		auth.POST("/login", userHandler.Login)
		auth.POST("/logout", userHandler.Logout)
		auth.GET("/me", middlewares.AuthMiddleware(sessionRepo), userHandler.GetCurrentUser)
	}

	user := r.Group(prefix + "/user")
	user.Use(middlewares.AuthMiddleware(sessionRepo))
	{
		user.PUT("/profile", userHandler.UpdateProfile)
		user.POST("/profile/photo", func(c *gin.Context) {
			userHandler.UploadProfilePhoto(c, imgPath, imgURLPrefix)
		})
	}
}
