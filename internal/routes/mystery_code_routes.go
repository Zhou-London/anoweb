package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/mysterycode"
	"github.com/gin-gonic/gin"
)

func registerMysteryCodeRoutes(
	r *gin.Engine,
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

	// Admin endpoints
	mysteryCodeAdmin := r.Group(prefix + "/mystery-code")
	mysteryCodeAdmin.Use(auth.AuthMiddleware(sessionRepo))
	mysteryCodeAdmin.Use(auth.AdminMiddleware())
	{
		mysteryCodeAdmin.POST("/create", handler.CreateCode)
		mysteryCodeAdmin.GET("/list", handler.GetAllCodes)
	}
}
