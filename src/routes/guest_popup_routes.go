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

	popup := r.Group(prefix + "/guest-popup")
	popup.Use(middlewares.KeyChecker(key))
	{
		// Public endpoint
		popup.GET("/active", handler.GetActiveConfig)

		// Admin endpoints
		adminPopup := popup.Group("")
		adminPopup.Use(middlewares.AuthMiddleware(sessionRepo))
		adminPopup.Use(middlewares.AdminMiddleware())
		{
			adminPopup.POST("/create", handler.CreateConfig)
			adminPopup.PUT("/:id", handler.UpdateConfig)
			adminPopup.GET("/list", handler.GetAllConfigs)
		}
	}
}
