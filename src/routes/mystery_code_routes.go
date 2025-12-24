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

	// User endpoint - verify code (no KeyChecker needed, just auth)
	mysteryCodeUser := r.Group(prefix + "/mystery-code")
	mysteryCodeUser.Use(middlewares.AuthMiddleware(sessionRepo))
	{
		mysteryCodeUser.POST("/verify", handler.VerifyCode)
	}

	// Admin endpoints (require KeyChecker and AdminMiddleware)
	mysteryCodeAdmin := r.Group(prefix + "/mystery-code")
	mysteryCodeAdmin.Use(middlewares.KeyChecker(key))
	mysteryCodeAdmin.Use(middlewares.AuthMiddleware(sessionRepo))
	mysteryCodeAdmin.Use(middlewares.AdminMiddleware())
	{
		mysteryCodeAdmin.POST("/create", handler.CreateCode)
		mysteryCodeAdmin.GET("/list", handler.GetAllCodes)
	}
}
