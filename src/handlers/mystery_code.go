package handlers

import (
	"net/http"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

type MysteryCodeHandler struct {
	mysteryCodeRepo *repositories.MysteryCodeRepository
	userRepo        *repositories.UserRepository
}

func NewMysteryCodeHandler(mysteryCodeRepo *repositories.MysteryCodeRepository, userRepo *repositories.UserRepository) *MysteryCodeHandler {
	return &MysteryCodeHandler{
		mysteryCodeRepo: mysteryCodeRepo,
		userRepo:        userRepo,
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

	// Get user ID from context
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

	// Verify and use the code
	if err := h.mysteryCodeRepo.VerifyAndUseCode(req.Code, uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or already used code"})
		return
	}

	// Update user to admin
	if err := h.userRepo.SetAdmin(uid, true); err != nil {
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
