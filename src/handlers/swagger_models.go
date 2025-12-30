package handlers

import (
	"time"

	"anonchihaya.co.uk/src/models"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

type AdminCheckRequest struct {
	Pass string `json:"pass" binding:"required"`
}

type AdminStatusResponse struct {
	IsAdmin bool `json:"isAdmin"`
}

type ImageUploadResponse struct {
	Message string `json:"message"`
	ImgPath string `json:"img_path"`
}

type FanAuthRegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type FanAuthLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type FanAuthResendVerificationRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type FanUpdateProfileRequest struct {
	Bio          *string `json:"bio"`
	ProfilePhoto *string `json:"profile_photo"`
}

type FanPublicProfileResponse struct {
	Message      string `json:"message"`
	ProfilePhoto string `json:"profile_photo"`
	Bio          string `json:"bio"`
}

type FanProfilePhotoResponse struct {
	Message      string `json:"message"`
	ProfilePhoto string `json:"profile_photo"`
}

type FanPublicUserResponse struct {
	ID            uint      `json:"id"`
	Username      string    `json:"username"`
	Email         string    `json:"email,omitempty"`
	IsAdmin       bool      `json:"is_admin,omitempty"`
	ProfilePhoto  string    `json:"profile_photo,omitempty"`
	Bio           string    `json:"bio,omitempty"`
	EmailVerified bool      `json:"email_verified,omitempty"`
	CreatedAt     time.Time `json:"created_at,omitempty"`
}

type FanAuthRegisterResponse struct {
	Message string                `json:"message"`
	User    FanPublicUserResponse `json:"user"`
}

type FanAuthLoginResponse struct {
	Message string                `json:"message"`
	User    FanPublicUserResponse `json:"user"`
}

type FanOAuthInitResponse struct {
	URL   string `json:"url"`
	State string `json:"state"`
}

type TotalHoursResponse struct {
	TotalHours float64 `json:"total_hours"`
}

type StreakResponse struct {
	Streak int `json:"streak"`
}

type OverallStatisticsResponse struct {
	TotalUsers             int64   `json:"total_users"`
	UniqueVisitorsEver     int64   `json:"unique_visitors_ever"`
	UniqueVisitors24h      int64   `json:"unique_visitors_24h"`
	RegisteredVisitorsEver int64   `json:"registered_visitors_ever"`
	GuestVisitorsEver      int64   `json:"guest_visitors_ever"`
	RegisteredVisitors24h  int64   `json:"registered_visitors_24h"`
	GuestVisitors24h       int64   `json:"guest_visitors_24h"`
	ActiveUsersToday       int64   `json:"active_users_today"`
	TotalHours             float64 `json:"total_hours"`
}

type ExperienceResponse struct {
	Experience models.Experience `json:"experience"`
}

type ExperiencesResponse struct {
	Experience []models.Experience `json:"experience"`
}

type ExperienceOrderUpdate struct {
	ID         int `json:"id"`
	OrderIndex int `json:"order_index"`
}

type TrackingSessionRequest struct {
	SessionID string `json:"session_id" binding:"required"`
}

type EducationImageUpdateRequest struct {
	ID       int    `json:"id" binding:"required"`
	ImageURL string `json:"image_url" binding:"required"`
}

type ProjectImageUpdateRequest struct {
	ID       int    `json:"id" binding:"required"`
	ImageURL string `json:"image_url" binding:"required"`
}

type PostCreateRequest struct {
	ParentID  int    `json:"parent_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
	ContentMD string `json:"content_md" binding:"required"`
}

type PostUpdateRequest struct {
	ID        int    `json:"id" binding:"required"`
	Name      string `json:"name"`
	ContentMD string `json:"content_md"`
}

type MysteryCodeRequest struct {
	Code string `json:"code" binding:"required"`
}

type GuestPopupConfigResponse = models.GuestPopupConfig

type GuestPopupConfigRequest struct {
	Title    string `json:"title" binding:"required"`
	Benefits string `json:"benefits" binding:"required"`
}
