package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func registerStatisticsRoutes(
	r *gin.Engine,
	statsRepo *repositories.StatisticsRepository,
	trackingRepo *repositories.UserTrackingRepository,
	sessionRepo *repositories.SessionRepository,
) {
	handler := handlers.NewStatisticsHandler(statsRepo, trackingRepo)

	stats := r.Group(prefix + "/statistics")
	{
		// Public endpoints
		stats.GET("/overall", handler.GetOverallStatistics)
		stats.GET("/users-over-time", handler.GetUsersOverTime)
		stats.GET("/daily-active", handler.GetDailyActiveUsers)

		// Authenticated endpoints
		stats.GET("/streak", middlewares.AuthMiddleware(sessionRepo), handler.GetUserStreak)
	}
}
