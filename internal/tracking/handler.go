package tracking

import (
	"net/http"

	"anonchihaya.co.uk/internal/auth"
	"github.com/gin-gonic/gin"
)

type TrackingHandler struct {
	trackingRepo *FanTrackingRepository
}

func NewTrackingHandler(trackingRepo *FanTrackingRepository) *TrackingHandler {
	return &TrackingHandler{trackingRepo: trackingRepo}
}

// StartTracking godoc
// @Summary Start tracking
// @Tags tracking
// @Accept json
// @Produce json
// @Param body body TrackingSessionRequest true "Session"
// @Success 200 {object} models.FanTracking
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /tracking/start [post]
func (h *TrackingHandler) StartTracking(c *gin.Context) {
	var req struct {
		SessionID string `json:"session_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get fan ID from context if authenticated
	var fanID *uint
	if fan, exists := c.Get("user"); exists {
		if f, ok := fan.(*auth.Fan); ok {
			fanID = &f.ID
		}
	}

	if fanID == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Guest sessions are not tracked"})
		return
	}

	tracking, err := h.trackingRepo.StartTracking(fanID, req.SessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start tracking"})
		return
	}

	c.JSON(http.StatusOK, tracking)
}

// EndTracking godoc
// @Summary End tracking
// @Tags tracking
// @Accept json
// @Produce json
// @Param body body TrackingSessionRequest true "Session"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /tracking/end [post]
func (h *TrackingHandler) EndTracking(c *gin.Context) {
	var req struct {
		SessionID string `json:"session_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get fan ID from context if authenticated
	var fanID *uint
	if fan, exists := c.Get("user"); exists {
		if f, ok := fan.(*auth.Fan); ok {
			fanID = &f.ID
		}
	}

	if fanID == nil {
		// Cleanup any lingering sessions for the guest session ID without tracking it
		_ = h.trackingRepo.EndTracking(req.SessionID, fanID)
		c.JSON(http.StatusOK, gin.H{"message": "Guest sessions are not tracked"})
		return
	}

	if err := h.trackingRepo.EndTracking(req.SessionID, fanID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to end tracking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tracking ended successfully"})
}

// UpdateTracking godoc
// @Summary Update tracking
// @Tags tracking
// @Accept json
// @Produce json
// @Param body body TrackingSessionRequest true "Session"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /tracking/update [post]
func (h *TrackingHandler) UpdateTracking(c *gin.Context) {
	var req struct {
		SessionID string `json:"session_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get fan ID from context if authenticated
	var fanID *uint
	if fan, exists := c.Get("user"); exists {
		if f, ok := fan.(*auth.Fan); ok {
			fanID = &f.ID
		}
	}

	if fanID == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Guest sessions are not tracked"})
		return
	}

	if err := h.trackingRepo.UpdateActiveSession(req.SessionID, fanID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tracking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tracking updated successfully"})
}

// GetTotalHours godoc
// @Summary Total tracked hours
// @Tags tracking
// @Produce json
// @Success 200 {object} TotalHoursResponse
// @Failure 500 {object} ErrorResponse
// @Router /tracking/total-hours [get]
func (h *TrackingHandler) GetTotalHours(c *gin.Context) {
	totalHours, err := h.trackingRepo.GetTotalHours()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total hours"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_hours": totalHours})
}

// GetUserTotalHours godoc
// @Summary Current user tracked hours
// @Tags tracking
// @Produce json
// @Success 200 {object} TotalHoursResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /tracking/user-hours [get]
func (h *TrackingHandler) GetUserTotalHours(c *gin.Context) {
	fan, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Fan not authenticated"})
		return
	}

	f, ok := fan.(*auth.Fan)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid fan context"})
		return
	}
	fid := f.ID

	totalHours, err := h.trackingRepo.GetFanTotalHours(fid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user hours"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_hours": totalHours})
}

// GetAllTrackingRecords godoc
// @Summary List tracking records
// @Tags tracking
// @Produce json
// @Success 200 {array} models.FanTracking
// @Failure 500 {object} ErrorResponse
// @Router /tracking/records [get]
func (h *TrackingHandler) GetAllTrackingRecords(c *gin.Context) {
	// Optional: filter by current fan if not admin
	var fanID *uint
	if fan, exists := c.Get("user"); exists {
		if f, ok := fan.(*auth.Fan); ok {
			// Check if fan is admin
			if !f.IsAdmin {
				// Non-admin fans can only see their own records
				fanID = &f.ID
			}
		}
	}

	records, err := h.trackingRepo.GetAllTrackingRecords(fanID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tracking records"})
		return
	}

	c.JSON(http.StatusOK, records)
}
