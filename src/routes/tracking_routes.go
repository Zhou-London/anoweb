package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerTrackingRoutes(
	r *gin.Engine,
	key string,
	trackingRepo *repositories.UserTrackingRepository,
	sessionRepo *repositories.SessionRepository,
) {
	handler := handlers.NewTrackingHandler(trackingRepo)

	// Tracking endpoints with optional authentication
	// These endpoints work for both guests and authenticated users
	tracking := r.Group(prefix + "/tracking")
	tracking.Use(middlewares.OptionalAuthMiddleware(sessionRepo))
	{
		tracking.POST("/start", handler.StartTracking)
		tracking.POST("/end", handler.EndTracking)
		tracking.POST("/update", handler.UpdateTracking)
		tracking.GET("/total-hours", handler.GetTotalHours)
	}

	// Authenticated tracking endpoints (require login)
	trackingAuth := r.Group(prefix + "/tracking")
	trackingAuth.Use(middlewares.AuthMiddleware(sessionRepo))
	{
		trackingAuth.GET("/user-hours", handler.GetUserTotalHours)
		trackingAuth.GET("/records", handler.GetAllTrackingRecords)
	}
}
