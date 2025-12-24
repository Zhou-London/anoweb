package handlers

import (
	"net/http"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

type TrackingHandler struct {
	trackingRepo *repositories.UserTrackingRepository
}

func NewTrackingHandler(trackingRepo *repositories.UserTrackingRepository) *TrackingHandler {
	return &TrackingHandler{trackingRepo: trackingRepo}
}

// StartTracking handles POST /api/tracking/start
func (h *TrackingHandler) StartTracking(c *gin.Context) {
	var req struct {
		SessionID string `json:"session_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context if authenticated
	var userID *uint
	if user, exists := c.Get("user"); exists {
		if u, ok := user.(*models.User); ok {
			userID = &u.ID
		}
	}

	tracking, err := h.trackingRepo.StartTracking(userID, req.SessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start tracking"})
		return
	}

	c.JSON(http.StatusOK, tracking)
}

// EndTracking handles POST /api/tracking/end
func (h *TrackingHandler) EndTracking(c *gin.Context) {
	var req struct {
		SessionID string `json:"session_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context if authenticated
	var userID *uint
	if user, exists := c.Get("user"); exists {
		if u, ok := user.(*models.User); ok {
			userID = &u.ID
		}
	}

	if err := h.trackingRepo.EndTracking(req.SessionID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to end tracking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tracking ended successfully"})
}

// UpdateTracking handles POST /api/tracking/update
func (h *TrackingHandler) UpdateTracking(c *gin.Context) {
	var req struct {
		SessionID string `json:"session_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context if authenticated
	var userID *uint
	if user, exists := c.Get("user"); exists {
		if u, ok := user.(*models.User); ok {
			userID = &u.ID
		}
	}

	if err := h.trackingRepo.UpdateActiveSession(req.SessionID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tracking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tracking updated successfully"})
}

// GetTotalHours handles GET /api/tracking/total-hours
func (h *TrackingHandler) GetTotalHours(c *gin.Context) {
	totalHours, err := h.trackingRepo.GetTotalHours()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total hours"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_hours": totalHours})
}

// GetUserTotalHours handles GET /api/tracking/user-hours
func (h *TrackingHandler) GetUserTotalHours(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	u, ok := user.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user context"})
		return
	}
	uid := u.ID

	totalHours, err := h.trackingRepo.GetUserTotalHours(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user hours"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_hours": totalHours})
}

// GetAllTrackingRecords handles GET /api/tracking/records
func (h *TrackingHandler) GetAllTrackingRecords(c *gin.Context) {
	// Optional: filter by current user if not admin
	var userID *uint
	if user, exists := c.Get("user"); exists {
		if u, ok := user.(*models.User); ok {
			// Check if user is admin
			if !u.IsAdmin {
				// Non-admin users can only see their own records
				userID = &u.ID
			}
		}
	}

	records, err := h.trackingRepo.GetAllTrackingRecords(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tracking records"})
		return
	}

	c.JSON(http.StatusOK, records)
}
