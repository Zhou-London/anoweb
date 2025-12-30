package handlers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"anonchihaya.co.uk/src/util"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type OAuthHandler struct {
	fanRepo     *repositories.FanRepository
	sessionRepo *repositories.SessionRepository
	domain      string
	googleConfig *oauth2.Config
}

func NewOAuthHandler(fanRepo *repositories.FanRepository, sessionRepo *repositories.SessionRepository, domain string) *OAuthHandler {
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	googleRedirectURL := os.Getenv("GOOGLE_REDIRECT_URL")

	if googleRedirectURL == "" {
		googleRedirectURL = "http://localhost:8080/api/auth/google/callback"
	}

	googleConfig := &oauth2.Config{
		ClientID:     googleClientID,
		ClientSecret: googleClientSecret,
		RedirectURL:  googleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &OAuthHandler{
		fanRepo:      fanRepo,
		sessionRepo:  sessionRepo,
		domain:       domain,
		googleConfig: googleConfig,
	}
}

// GoogleLogin initiates Google OAuth flow
func (h *OAuthHandler) GoogleLogin(c *gin.Context) {
	// Check if Google OAuth is configured
	if h.googleConfig.ClientID == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Google OAuth is not configured"})
		return
	}

	state := util.GenerateSessionToken()
	url := h.googleConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)

	c.JSON(http.StatusOK, gin.H{
		"url":   url,
		"state": state,
	})
}

// GoogleCallback handles the callback from Google OAuth
func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code not provided"})
		return
	}

	// Exchange code for token
	token, err := h.googleConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to exchange token"})
		return
	}

	// Get user info from Google
	client := h.googleConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read user info"})
		return
	}

	var googleUser struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		VerifiedEmail bool   `json:"verified_email"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
	}

	if err := json.Unmarshal(data, &googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
		return
	}

	// Find or create fan
	fan, err := h.fanRepo.FindByOAuthID("google", googleUser.ID)
	if err != nil {
		// Check if email already exists (from regular registration)
		existingFan, emailErr := h.fanRepo.FindByEmail(googleUser.Email)
		if emailErr == nil {
			// Email exists, link Google account to existing fan
			existingFan.OAuthProvider = "google"
			existingFan.OAuthID = googleUser.ID
			existingFan.EmailVerified = googleUser.VerifiedEmail
			if existingFan.ProfilePhoto == "" {
				existingFan.ProfilePhoto = googleUser.Picture
			}
			if err := h.fanRepo.Update(existingFan); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link Google account"})
				return
			}
			fan = existingFan
		} else {
			// Create new fan from Google account
			fan = &models.Fan{
				Username:      googleUser.Email, // Use email as username initially
				Email:         googleUser.Email,
				OAuthProvider: "google",
				OAuthID:       googleUser.ID,
				EmailVerified: googleUser.VerifiedEmail,
				ProfilePhoto:  googleUser.Picture,
				IsAdmin:       false,
			}

			if err := h.fanRepo.Create(fan); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create fan"})
				return
			}
		}
	}

	// Create session
	sessionToken := util.GenerateSessionToken()
	session := &models.Session{
		FanID:     fan.ID,
		Token:     sessionToken,
		ExpiresAt: util.GetSessionExpiry(),
	}

	if err := h.sessionRepo.Create(session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Set cookie
	c.SetCookie("session_token", sessionToken, 7*24*60*60, "/", h.domain, false, true)

	// Redirect to frontend
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}
	c.Redirect(http.StatusFound, frontendURL+"/?oauth=success")
}
