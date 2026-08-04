package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/guestpopup"
	"github.com/gin-gonic/gin"
)

func registerGuestPopupRoutes(
	r *gin.Engine,
	popupRepo *guestpopup.GuestPopupConfigRepository,
	sessionRepo *auth.SessionRepository,
) {
	handler := guestpopup.NewGuestPopupHandler(popupRepo)

	// Public endpoint (no key required for GET)
	popup := r.Group(prefix + "/guest-popup")
	{
		popup.GET("/active", handler.GetActiveConfig)
	}

	// Admin endpoints
	adminPopup := r.Group(prefix + "/guest-popup")
	adminPopup.Use(auth.AuthMiddleware(sessionRepo))
	adminPopup.Use(auth.AdminMiddleware())
	{
		adminPopup.POST("/create", handler.CreateConfig)
		adminPopup.PUT("/:id", handler.UpdateConfig)
		adminPopup.GET("/list", handler.GetAllConfigs)
	}
}
