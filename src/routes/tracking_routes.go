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

	// Public tracking endpoints (no auth or key required)
	trackingPublic := r.Group(prefix + "/tracking")
	{
		trackingPublic.POST("/start", handler.StartTracking)
		trackingPublic.POST("/end", handler.EndTracking)
		trackingPublic.POST("/update", handler.UpdateTracking)
		trackingPublic.GET("/total-hours", handler.GetTotalHours)
	}

	// Authenticated tracking endpoints
	trackingAuth := r.Group(prefix + "/tracking")
	trackingAuth.Use(middlewares.AuthMiddleware(sessionRepo))
	{
		trackingAuth.GET("/user-hours", handler.GetUserTotalHours)
		trackingAuth.GET("/records", handler.GetAllTrackingRecords)
	}
}
