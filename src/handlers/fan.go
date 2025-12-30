package handlers

import (
	"net/http"
	"strconv"
	"time"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"anonchihaya.co.uk/src/util"
	"github.com/gin-gonic/gin"
)

type FanHandler struct {
	fanRepo     *repositories.FanRepository
	sessionRepo *repositories.SessionRepository
	domain      string
}

func NewFanHandler(fanRepo *repositories.FanRepository, sessionRepo *repositories.SessionRepository, domain string) *FanHandler {
	return &FanHandler{
		fanRepo:     fanRepo,
		sessionRepo: sessionRepo,
		domain:      domain,
	}
}

// Register godoc
// @Summary Register
// @Tags auth
// @Accept json
// @Produce json
// @Param body body FanAuthRegisterRequest true "Registration"
// @Success 201 {object} FanAuthRegisterResponse
// @Failure 400 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/register [post]
func (h *FanHandler) Register(c *gin.Context) {
	type RegisterRequest struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if username already exists
	if _, err := h.fanRepo.FindByUsername(req.Username); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// Check if email already exists
	if _, err := h.fanRepo.FindByEmail(req.Email); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	// Hash password
	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Generate verification token
	verificationToken := util.GenerateVerificationToken()

	// Create fan
	fan := &models.Fan{
		Username:          req.Username,
		Email:             req.Email,
		PasswordHash:      hashedPassword,
		IsAdmin:           false,
		EmailVerified:     false,
		VerificationToken: verificationToken,
	}

	if err := h.fanRepo.Create(fan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create fan"})
		return
	}

	// Send verification email (non-blocking, errors are logged but don't fail registration)
	frontendURL := c.GetHeader("Origin")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // fallback for development
	}
	go util.SendVerificationEmail(fan.Email, verificationToken, frontendURL)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Fan registered successfully. Please check your email to verify your account.",
		"user": gin.H{
			"id":             fan.ID,
			"username":       fan.Username,
			"email":          fan.Email,
			"email_verified": fan.EmailVerified,
		},
	})
}

// Login godoc
// @Summary Login
// @Tags auth
// @Accept json
// @Produce json
// @Param body body FanAuthLoginRequest true "Login"
// @Success 200 {object} FanAuthLoginResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/login [post]
func (h *FanHandler) Login(c *gin.Context) {
	type LoginRequest struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find fan by username
	fan, err := h.fanRepo.FindByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// Check password
	if !util.CheckPasswordHash(req.Password, fan.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// Create session
	token := util.GenerateSessionToken()
	session := &models.Session{
		FanID:     fan.ID,
		Token:     token,
		ExpiresAt: util.GetSessionExpiry(),
	}

	if err := h.sessionRepo.Create(session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Set cookie
	c.SetCookie("session_token", token, 7*24*60*60, "/", h.domain, false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":            fan.ID,
			"username":      fan.Username,
			"email":         fan.Email,
			"is_admin":      fan.IsAdmin,
			"profile_photo": fan.ProfilePhoto,
			"bio":           fan.Bio,
		},
	})
}

// Logout godoc
// @Summary Logout
// @Tags auth
// @Produce json
// @Success 200 {object} MessageResponse
// @Router /auth/logout [post]
func (h *FanHandler) Logout(c *gin.Context) {
	token, err := c.Cookie("session_token")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Already logged out"})
		return
	}

	// Delete session from database
	h.sessionRepo.DeleteByToken(token)

	// Clear cookie
	c.SetCookie("session_token", "", -1, "/", h.domain, false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetCurrentUser godoc
// @Summary Current user
// @Tags auth
// @Produce json
// @Success 200 {object} FanPublicUserResponse
// @Failure 401 {object} ErrorResponse
// @Router /auth/me [get]
func (h *FanHandler) GetCurrentUser(c *gin.Context) {
	fan, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	currentFan := fan.(*models.Fan)
	c.JSON(http.StatusOK, gin.H{
		"id":            currentFan.ID,
		"username":      currentFan.Username,
		"email":         currentFan.Email,
		"is_admin":      currentFan.IsAdmin,
		"profile_photo": currentFan.ProfilePhoto,
		"bio":           currentFan.Bio,
		"created_at":    currentFan.CreatedAt,
	})
}

// UpdateProfile godoc
// @Summary Update profile
// @Tags fan
// @Accept json
// @Produce json
// @Param body body FanUpdateProfileRequest true "Profile fields"
// @Success 200 {object} FanPublicProfileResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /fan/profile [put]
// @Router /user/profile [put]
func (h *FanHandler) UpdateProfile(c *gin.Context) {
	fan, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	currentFan := fan.(*models.Fan)

	type UpdateProfileRequest struct {
		Bio          *string `json:"bio"`
		ProfilePhoto *string `json:"profile_photo"`
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields if provided
	if req.Bio != nil {
		currentFan.Bio = *req.Bio
	}
	if req.ProfilePhoto != nil {
		currentFan.ProfilePhoto = *req.ProfilePhoto
	}

	if err := h.fanRepo.Update(currentFan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Profile updated successfully",
		"profile_photo": currentFan.ProfilePhoto,
		"bio":           currentFan.Bio,
	})
}

// UploadProfilePhoto godoc
// @Summary Upload profile photo
// @Tags fan
// @Accept mpfd
// @Produce json
// @Param file formData file true "Image file"
// @Success 200 {object} FanProfilePhotoResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /fan/profile/photo [post]
// @Router /user/profile/photo [post]
func (h *FanHandler) UploadProfilePhoto(c *gin.Context, imgPath, imgURLPrefix string) {
	fan, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	currentFan := fan.(*models.Fan)

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	if !util.IsImage(file.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is not an image"})
		return
	}

	// Generate unique filename
	timestamp := time.Now().UnixMilli()
	filename := "/profile-" + strconv.FormatInt(timestamp, 10) + "-" + file.Filename

	// Save file
	if err := c.SaveUploadedFile(file, imgPath+filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Update fan profile photo
	photoURL := imgURLPrefix + filename
	currentFan.ProfilePhoto = photoURL

	if err := h.fanRepo.Update(currentFan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile photo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Profile photo uploaded successfully",
		"profile_photo": photoURL,
	})
}

// VerifyEmail godoc
// @Summary Verify email
// @Tags auth
// @Produce json
// @Param token query string true "Verification token"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/verify-email [get]
func (h *FanHandler) VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token is required"})
		return
	}

	fan, err := h.fanRepo.FindByVerificationToken(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification token"})
		return
	}

	if fan.EmailVerified {
		c.JSON(http.StatusOK, gin.H{"message": "Email already verified"})
		return
	}

	fan.EmailVerified = true
	fan.VerificationToken = "" // Clear the token after verification

	if err := h.fanRepo.Update(fan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email verified successfully",
	})
}

// ResendVerificationEmail godoc
// @Summary Resend verification email
// @Tags auth
// @Accept json
// @Produce json
// @Param body body FanAuthResendVerificationRequest true "Email"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/resend-verification [post]
func (h *FanHandler) ResendVerificationEmail(c *gin.Context) {
	type ResendRequest struct {
		Email string `json:"email" binding:"required,email"`
	}

	var req ResendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fan, err := h.fanRepo.FindByEmail(req.Email)
	if err != nil {
		// Don't reveal if email exists or not
		c.JSON(http.StatusOK, gin.H{"message": "If the email exists and is not verified, a verification email has been sent"})
		return
	}

	if fan.EmailVerified {
		c.JSON(http.StatusOK, gin.H{"message": "Email is already verified"})
		return
	}

	// Generate new verification token
	verificationToken := util.GenerateVerificationToken()
	fan.VerificationToken = verificationToken

	if err := h.fanRepo.Update(fan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update verification token"})
		return
	}

	// Send verification email
	frontendURL := c.GetHeader("Origin")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}
	go util.SendVerificationEmail(fan.Email, verificationToken, frontendURL)

	c.JSON(http.StatusOK, gin.H{"message": "Verification email has been sent"})
}

// GetAllUsers godoc
// @Summary List users
// @Tags fan
// @Produce json
// @Success 200 {array} FanPublicUserResponse
// @Failure 500 {object} ErrorResponse
// @Router /fan/list [get]
// @Router /user/list [get]
func (h *FanHandler) GetAllUsers(c *gin.Context) {
	fans, err := h.fanRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return only safe fields
	safeFans := make([]gin.H, len(fans))
	for i, fan := range fans {
		safeFans[i] = gin.H{
			"id":            fan.ID,
			"username":      fan.Username,
			"profile_photo": fan.ProfilePhoto,
			"bio":           fan.Bio,
			"created_at":    fan.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, safeFans)
}
