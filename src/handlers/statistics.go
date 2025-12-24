package handlers

import (
	"fmt"
	"net/http"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

type StatisticsHandler struct {
	statsRepo    *repositories.StatisticsRepository
	trackingRepo *repositories.UserTrackingRepository
}

func NewStatisticsHandler(statsRepo *repositories.StatisticsRepository, trackingRepo *repositories.UserTrackingRepository) *StatisticsHandler {
	return &StatisticsHandler{
		statsRepo:    statsRepo,
		trackingRepo: trackingRepo,
	}
}

// GetOverallStatistics handles GET /api/statistics/overall
func (h *StatisticsHandler) GetOverallStatistics(c *gin.Context) {
	totalUsers, err := h.statsRepo.GetTotalUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total users"})
		return
	}

	uniqueVisitors, err := h.statsRepo.GetUniqueVisitors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get unique visitors"})
		return
	}

	visitors24h, err := h.statsRepo.GetUniqueVisitorsLast24Hours()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get 24h visitors"})
		return
	}

	registeredEver, err := h.statsRepo.GetRegisteredVisitorsEver()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get registered visitors"})
		return
	}

	guestEver, err := h.statsRepo.GetGuestVisitorsEver()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get guest visitors"})
		return
	}

	registered24h, err := h.statsRepo.GetRegisteredVisitorsLast24Hours()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get registered visitors 24h"})
		return
	}

	guest24h, err := h.statsRepo.GetGuestVisitorsLast24Hours()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get guest visitors 24h"})
		return
	}

	activeToday, err := h.statsRepo.GetActiveUsersToday()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get active users today"})
		return
	}

	totalHours, err := h.trackingRepo.GetTotalHours()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total hours"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_users":              totalUsers,
		"unique_visitors_ever":     uniqueVisitors,
		"unique_visitors_24h":      visitors24h,
		"registered_visitors_ever": registeredEver,
		"guest_visitors_ever":      guestEver,
		"registered_visitors_24h":  registered24h,
		"guest_visitors_24h":       guest24h,
		"active_users_today":       activeToday,
		"total_hours":              totalHours,
	})
}

// GetUserStreak handles GET /api/statistics/streak (authenticated)
func (h *StatisticsHandler) GetUserStreak(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	u, ok := user.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user context"})
		return
	}

	streak, err := h.statsRepo.GetUserStreak(u.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user streak"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"streak": streak,
	})
}

// GetUsersOverTime handles GET /api/statistics/users-over-time?hours=24
func (h *StatisticsHandler) GetUsersOverTime(c *gin.Context) {
	hours := 24 // default
	if h := c.Query("hours"); h != "" {
		if parsed, err := parseIntQuery(h); err == nil && parsed > 0 && parsed <= 168 {
			hours = parsed
		}
	}

	data, err := h.statsRepo.GetUsersOverTime(hours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users over time"})
		return
	}

	c.JSON(http.StatusOK, data)
}

// GetDailyActiveUsers handles GET /api/statistics/daily-active?days=30
func (h *StatisticsHandler) GetDailyActiveUsers(c *gin.Context) {
	days := 30 // default
	if d := c.Query("days"); d != "" {
		if parsed, err := parseIntQuery(d); err == nil && parsed > 0 && parsed <= 365 {
			days = parsed
		}
	}

	data, err := h.statsRepo.GetDailyActiveUsers(days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get daily active users"})
		return
	}

	c.JSON(http.StatusOK, data)
}

func parseIntQuery(s string) (int, error) {
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}
