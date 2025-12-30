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
	trackingRepo *repositories.FanTrackingRepository
}

func NewStatisticsHandler(statsRepo *repositories.StatisticsRepository, trackingRepo *repositories.FanTrackingRepository) *StatisticsHandler {
	return &StatisticsHandler{
		statsRepo:    statsRepo,
		trackingRepo: trackingRepo,
	}
}

// GetOverallStatistics godoc
// @Summary Overall statistics
// @Tags statistics
// @Produce json
// @Success 200 {object} OverallStatisticsResponse
// @Failure 500 {object} ErrorResponse
// @Router /statistics/overall [get]
func (h *StatisticsHandler) GetOverallStatistics(c *gin.Context) {
	totalFans, err := h.statsRepo.GetTotalFans()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total fans"})
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
		"total_users":              totalFans,
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

// GetUserStreak godoc
// @Summary Current user streak
// @Tags statistics
// @Produce json
// @Success 200 {object} StreakResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /statistics/streak [get]
func (h *StatisticsHandler) GetUserStreak(c *gin.Context) {
	fan, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	f, ok := fan.(*models.Fan)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid fan context"})
		return
	}

	streak, err := h.statsRepo.GetFanStreak(f.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get fan streak"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"streak": streak,
	})
}

// GetUsersOverTime godoc
// @Summary Visitors over time
// @Tags statistics
// @Produce json
// @Param hours query int false "Hours (1-168)" default(24)
// @Success 200 {array} repositories.FansOverTimePoint
// @Failure 500 {object} ErrorResponse
// @Router /statistics/users-over-time [get]
func (h *StatisticsHandler) GetUsersOverTime(c *gin.Context) {
	hours := 24 // default
	if h := c.Query("hours"); h != "" {
		if parsed, err := parseIntQuery(h); err == nil && parsed > 0 && parsed <= 168 {
			hours = parsed
		}
	}

	data, err := h.statsRepo.GetFansOverTime(hours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get visitors over time"})
		return
	}

	c.JSON(http.StatusOK, data)
}

// GetDailyActiveUsers godoc
// @Summary Daily active users
// @Tags statistics
// @Produce json
// @Param days query int false "Days (1-365)" default(30)
// @Success 200 {array} repositories.DailyActiveUsersPoint
// @Failure 500 {object} ErrorResponse
// @Router /statistics/daily-active [get]
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
