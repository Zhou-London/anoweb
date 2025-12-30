package handlers

import (
	"net/http"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

type MysteryCodeHandler struct {
	mysteryCodeRepo *repositories.MysteryCodeRepository
	fanRepo         *repositories.FanRepository
}

func NewMysteryCodeHandler(mysteryCodeRepo *repositories.MysteryCodeRepository, fanRepo *repositories.FanRepository) *MysteryCodeHandler {
	return &MysteryCodeHandler{
		mysteryCodeRepo: mysteryCodeRepo,
		fanRepo:         fanRepo,
	}
}

// VerifyCode handles POST /api/mystery-code/verify
func (h *MysteryCodeHandler) VerifyCode(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get fan ID from context
	fan, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Fan not authenticated"})
		return
	}

	f, ok := fan.(*models.Fan)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid fan context"})
		return
	}
	fid := f.ID

	// Verify and use the code
	if err := h.mysteryCodeRepo.VerifyAndUseCode(req.Code, fid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or already used code"})
		return
	}

	// Update fan to admin
	if err := h.fanRepo.SetAdmin(fid, true); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to grant admin privileges"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Admin privileges granted successfully"})
}

// CreateCode handles POST /api/mystery-code/create (admin only)
func (h *MysteryCodeHandler) CreateCode(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	code, err := h.mysteryCodeRepo.CreateCode(req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create code"})
		return
	}

	c.JSON(http.StatusOK, code)
}

// GetAllCodes handles GET /api/mystery-code/list (admin only)
func (h *MysteryCodeHandler) GetAllCodes(c *gin.Context) {
	codes, err := h.mysteryCodeRepo.GetAllCodes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get codes"})
		return
	}

	c.JSON(http.StatusOK, codes)
}
