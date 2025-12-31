package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/statistics"
	"anonchihaya.co.uk/internal/tracking"
	"github.com/gin-gonic/gin"
)

func registerStatisticsRoutes(
	r *gin.Engine,
	statsRepo *statistics.StatisticsRepository,
	trackingRepo *tracking.FanTrackingRepository,
	sessionRepo *auth.SessionRepository,
) {
	handler := statistics.NewStatisticsHandler(statsRepo, trackingRepo)

	statsGroup := r.Group(prefix + "/statistics")
	{
		// Public endpoints
		statsGroup.GET("/overall", handler.GetOverallStatistics)
		statsGroup.GET("/users-over-time", handler.GetUsersOverTime)
		statsGroup.GET("/daily-active", handler.GetDailyActiveUsers)

		// Authenticated endpoints
		statsGroup.GET("/streak", auth.AuthMiddleware(sessionRepo), handler.GetUserStreak)
	}
}
