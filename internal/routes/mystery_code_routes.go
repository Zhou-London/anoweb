package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/middlewares"
	"anonchihaya.co.uk/internal/mysterycode"
	"github.com/gin-gonic/gin"
)

func registerMysteryCodeRoutes(
	r *gin.Engine,
	key string,
	mysteryCodeRepo *mysterycode.MysteryCodeRepository,
	fanRepo *auth.FanRepository,
	sessionRepo *auth.SessionRepository,
) {
	handler := mysterycode.NewMysteryCodeHandler(mysteryCodeRepo, fanRepo)

	// User endpoint - verify code (no KeyChecker needed, just auth)
	mysteryCodeUser := r.Group(prefix + "/mystery-code")
	mysteryCodeUser.Use(auth.AuthMiddleware(sessionRepo))
	{
		mysteryCodeUser.POST("/verify", handler.VerifyCode)
	}

	// Admin endpoints (require KeyChecker and AdminMiddleware)
	mysteryCodeAdmin := r.Group(prefix + "/mystery-code")
	mysteryCodeAdmin.Use(middlewares.KeyChecker(key))
	mysteryCodeAdmin.Use(auth.AuthMiddleware(sessionRepo))
	mysteryCodeAdmin.Use(auth.AdminMiddleware())
	{
		mysteryCodeAdmin.POST("/create", handler.CreateCode)
		mysteryCodeAdmin.GET("/list", handler.GetAllCodes)
	}
}
