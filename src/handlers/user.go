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

type UserHandler struct {
	userRepo    *repositories.UserRepository
	sessionRepo *repositories.SessionRepository
	domain      string
}

func NewUserHandler(userRepo *repositories.UserRepository, sessionRepo *repositories.SessionRepository, domain string) *UserHandler {
	return &UserHandler{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		domain:      domain,
	}
}

// Register handles user registration
func (h *UserHandler) Register(c *gin.Context) {
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
	if _, err := h.userRepo.FindByUsername(req.Username); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// Check if email already exists
	if _, err := h.userRepo.FindByEmail(req.Email); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	// Hash password
	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	user := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		IsAdmin:      false,
	}

	if err := h.userRepo.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// Login handles user login
func (h *UserHandler) Login(c *gin.Context) {
	type LoginRequest struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by username
	user, err := h.userRepo.FindByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// Check password
	if !util.CheckPasswordHash(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// Create session
	token := util.GenerateSessionToken()
	session := &models.Session{
		UserID:    user.ID,
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
			"id":            user.ID,
			"username":      user.Username,
			"email":         user.Email,
			"is_admin":      user.IsAdmin,
			"profile_photo": user.ProfilePhoto,
			"bio":           user.Bio,
		},
	})
}

// Logout handles user logout
func (h *UserHandler) Logout(c *gin.Context) {
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

// GetCurrentUser returns the current authenticated user
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	currentUser := user.(*models.User)
	c.JSON(http.StatusOK, gin.H{
		"id":            currentUser.ID,
		"username":      currentUser.Username,
		"email":         currentUser.Email,
		"is_admin":      currentUser.IsAdmin,
		"profile_photo": currentUser.ProfilePhoto,
		"bio":           currentUser.Bio,
		"created_at":    currentUser.CreatedAt,
	})
}

// UpdateProfile handles profile updates
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	currentUser := user.(*models.User)

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
		currentUser.Bio = *req.Bio
	}
	if req.ProfilePhoto != nil {
		currentUser.ProfilePhoto = *req.ProfilePhoto
	}

	if err := h.userRepo.Update(currentUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Profile updated successfully",
		"profile_photo": currentUser.ProfilePhoto,
		"bio":           currentUser.Bio,
	})
}

// UploadProfilePhoto handles profile photo upload
func (h *UserHandler) UploadProfilePhoto(c *gin.Context, imgPath, imgURLPrefix string) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	currentUser := user.(*models.User)

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

	// Update user profile photo
	photoURL := imgURLPrefix + filename
	currentUser.ProfilePhoto = photoURL

	if err := h.userRepo.Update(currentUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile photo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Profile photo uploaded successfully",
		"profile_photo": photoURL,
	})
}
