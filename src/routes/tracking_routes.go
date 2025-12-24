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

	tracking := r.Group(prefix + "/tracking")
	tracking.Use(middlewares.KeyChecker(key))
	{
		// Public endpoints (no auth required, but key checked)
		tracking.POST("/start", handler.StartTracking)
		tracking.POST("/end", handler.EndTracking)
		tracking.POST("/update", handler.UpdateTracking)
		tracking.GET("/total-hours", handler.GetTotalHours)

		// Authenticated endpoints
		authTracking := tracking.Group("")
		authTracking.Use(middlewares.AuthMiddleware(sessionRepo))
		{
			authTracking.GET("/user-hours", handler.GetUserTotalHours)
			authTracking.GET("/records", handler.GetAllTrackingRecords)
		}
	}
}
