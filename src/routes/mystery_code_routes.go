package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerMysteryCodeRoutes(
	r *gin.Engine,
	key string,
	mysteryCodeRepo *repositories.MysteryCodeRepository,
	userRepo *repositories.UserRepository,
	sessionRepo *repositories.SessionRepository,
) {
	handler := handlers.NewMysteryCodeHandler(mysteryCodeRepo, userRepo)

	mysteryCode := r.Group(prefix + "/mystery-code")
	mysteryCode.Use(middlewares.KeyChecker(key))
	mysteryCode.Use(middlewares.AuthMiddleware(sessionRepo))
	{
		// User endpoint - verify code
		mysteryCode.POST("/verify", handler.VerifyCode)

		// Admin endpoints
		mysteryCode.POST("/create", middlewares.AdminMiddleware(), handler.CreateCode)
		mysteryCode.GET("/list", middlewares.AdminMiddleware(), handler.GetAllCodes)
	}
}
