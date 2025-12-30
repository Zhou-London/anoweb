package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerGuestPopupRoutes(
	r *gin.Engine,
	key string,
	popupRepo *repositories.GuestPopupConfigRepository,
	sessionRepo *repositories.SessionRepository,
) {
	handler := handlers.NewGuestPopupHandler(popupRepo)

	// Public endpoint (no key required for GET)
	popup := r.Group(prefix + "/guest-popup")
	{
		popup.GET("/active", handler.GetActiveConfig)
	}

	// Admin endpoints (require key, auth, and admin)
	adminPopup := r.Group(prefix + "/guest-popup")
	adminPopup.Use(middlewares.KeyChecker(key))
	adminPopup.Use(middlewares.AuthMiddleware(sessionRepo))
	adminPopup.Use(middlewares.AdminMiddleware())
	{
		adminPopup.POST("/create", handler.CreateConfig)
		adminPopup.PUT("/:id", handler.UpdateConfig)
		adminPopup.GET("/list", handler.GetAllConfigs)
	}
}
