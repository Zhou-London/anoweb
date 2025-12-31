package guestpopup

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type GuestPopupHandler struct {
	popupRepo *GuestPopupConfigRepository
}

func NewGuestPopupHandler(popupRepo *GuestPopupConfigRepository) *GuestPopupHandler {
	return &GuestPopupHandler{popupRepo: popupRepo}
}

// GetActiveConfig godoc
// @Summary Get active guest popup config
// @Tags guest-popup
// @Produce json
// @Success 200 {object} GuestPopupConfigResponse
// @Failure 404 {object} ErrorResponse
// @Router /guest-popup/active [get]
func (h *GuestPopupHandler) GetActiveConfig(c *gin.Context) {
	config, err := h.popupRepo.GetActiveConfig()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active configuration found"})
		return
	}

	c.JSON(http.StatusOK, config)
}

// CreateConfig godoc
// @Summary Create guest popup config
// @Tags guest-popup
// @Accept json
// @Produce json
// @Param body body GuestPopupConfigRequest true "Config"
// @Success 200 {object} GuestPopupConfigResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /guest-popup/create [post]
func (h *GuestPopupHandler) CreateConfig(c *gin.Context) {
	var req struct {
		Title    string `json:"title" binding:"required"`
		Benefits string `json:"benefits" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config, err := h.popupRepo.CreateConfig(req.Title, req.Benefits)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create configuration"})
		return
	}

	c.JSON(http.StatusOK, config)
}

// UpdateConfig godoc
// @Summary Update guest popup config
// @Tags guest-popup
// @Accept json
// @Produce json
// @Param id path int true "Config ID"
// @Param body body GuestPopupConfigRequest true "Config"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /guest-popup/{id} [put]
func (h *GuestPopupHandler) UpdateConfig(c *gin.Context) {
	var req struct {
		Title    string `json:"title" binding:"required"`
		Benefits string `json:"benefits" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id uint
	if err := c.ShouldBindUri(&struct{ ID uint }{ID: id}); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.popupRepo.UpdateConfig(id, req.Title, req.Benefits); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update configuration"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Configuration updated successfully"})
}

// GetAllConfigs godoc
// @Summary List guest popup configs
// @Tags guest-popup
// @Produce json
// @Success 200 {array} GuestPopupConfigResponse
// @Failure 500 {object} ErrorResponse
// @Router /guest-popup/list [get]
func (h *GuestPopupHandler) GetAllConfigs(c *gin.Context) {
	configs, err := h.popupRepo.GetAllConfigs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get configurations"})
		return
	}

	c.JSON(http.StatusOK, configs)
}
