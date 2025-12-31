package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/tracking"
	"github.com/gin-gonic/gin"
)

func registerTrackingRoutes(
	r *gin.Engine,
	key string,
	trackingRepo *tracking.FanTrackingRepository,
	sessionRepo *auth.SessionRepository,
) {
	handler := tracking.NewTrackingHandler(trackingRepo)

	// Public tracking endpoints with optional auth (to capture user ID when logged in)
	trackingPublic := r.Group(prefix + "/tracking")
	trackingPublic.Use(auth.OptionalAuthMiddleware(sessionRepo))
	{
		trackingPublic.POST("/start", handler.StartTracking)
		trackingPublic.POST("/end", handler.EndTracking)
		trackingPublic.POST("/update", handler.UpdateTracking)
		trackingPublic.GET("/total-hours", handler.GetTotalHours)
	}

	// Authenticated tracking endpoints
	trackingAuth := r.Group(prefix + "/tracking")
	trackingAuth.Use(auth.AuthMiddleware(sessionRepo))
	{
		trackingAuth.GET("/user-hours", handler.GetUserTotalHours)
		trackingAuth.GET("/records", handler.GetAllTrackingRecords)
	}
}
