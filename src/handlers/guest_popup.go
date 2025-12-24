package handlers

import (
	"net/http"

	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

type GuestPopupHandler struct {
	popupRepo *repositories.GuestPopupConfigRepository
}

func NewGuestPopupHandler(popupRepo *repositories.GuestPopupConfigRepository) *GuestPopupHandler {
	return &GuestPopupHandler{popupRepo: popupRepo}
}

// GetActiveConfig handles GET /api/guest-popup/active
func (h *GuestPopupHandler) GetActiveConfig(c *gin.Context) {
	config, err := h.popupRepo.GetActiveConfig()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active configuration found"})
		return
	}

	c.JSON(http.StatusOK, config)
}

// CreateConfig handles POST /api/guest-popup/create (admin only)
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

// UpdateConfig handles PUT /api/guest-popup/:id (admin only)
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

// GetAllConfigs handles GET /api/guest-popup/list (admin only)
func (h *GuestPopupHandler) GetAllConfigs(c *gin.Context) {
	configs, err := h.popupRepo.GetAllConfigs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get configurations"})
		return
	}

	c.JSON(http.StatusOK, configs)
}
