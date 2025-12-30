package handlers

import (
	"net/http"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"anonchihaya.co.uk/src/util"
	"github.com/gin-gonic/gin"
)

// UploadProfileImg godoc
// @Summary Upload profile image
// @Tags profile
// @Accept mpfd
// @Produce json
// @Param file formData file true "Image file"
// @Success 200 {object} ImageUploadResponse
// @Failure 400 {string} string
// @Failure 500 {string} string
// @Router /profile/upload-image [post]
func UploadProfileImg(c *gin.Context, img_path string, img_url_prefix string) {
	file, err := c.FormFile("file")
	if err != nil {
		c.String(http.StatusBadRequest, "file not found")
		return
	}

	dst := img_path + "/profile-img.png"
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.String(http.StatusInternalServerError, "save failed: %s", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "upload success",
		"img_path": img_url_prefix + "/profile-img.png",
	})
}

// GetProfileInfo godoc
// @Summary Get profile
// @Tags profile
// @Produce json
// @Success 200 {object} models.Profile
// @Failure 500 {object} ErrorResponse
// @Router /profile [get]
func GetProfileInfo(c *gin.Context, profile_repo repositories.ProfileRepository) {
	profile, err := profile_repo.GetByID(1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetProfileInfo() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// DeleteProfileInfo godoc
// @Summary Delete profile
// @Tags profile
// @Produce json
// @Success 200 {object} MessageResponse
// @Failure 500 {object} ErrorResponse
// @Router /profile [delete]
func DeleteProfileInfo(c *gin.Context, profile_repo repositories.ProfileRepository) {
	err := profile_repo.Delete(1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetDeletePRofileInfo() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile info deleted successfully"})
}

// PostProfileInfo godoc
// @Summary Create profile
// @Tags profile
// @Accept json
// @Produce json
// @Param body body models.Profile true "Profile"
// @Success 200 {object} models.Profile
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /profile [post]
func PostProfileInfo(c *gin.Context, profile_repo repositories.ProfileRepository) {

	count, countErr := profile_repo.Counts()
	if countErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PostCreateProfileInfo() error": countErr.Error()})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"PostCreateProfileInfo() error": "Profile info already exists"})
		return
	}

	var profile models.Profile
	if err := c.ShouldBind(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"PostCreateProfileInfo() error": err.Error()})
		return
	}

	createErr := profile_repo.Create(&profile)
	if createErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PostCreateProfileInfo() error": createErr.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// PutProfileInfo godoc
// @Summary Update profile
// @Tags profile
// @Accept json
// @Produce json
// @Param body body models.Profile true "Profile fields"
// @Success 200 {object} models.Profile
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /profile [put]
func PutProfileInfo(c *gin.Context, profile_repo repositories.ProfileRepository) {

	oldProfile, err := profile_repo.GetByID(1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PutUpdateProfileInfo() error": err.Error()})
		return
	}

	if oldProfile == nil {
		c.JSON(http.StatusBadRequest, gin.H{"PutUpdateProfileInfo() error": "Profile info does not exist"})
		return
	}

	var profile models.Profile
	if err := c.ShouldBind(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"PutUpdateProfileInfo() error": err.Error()})
		return
	}

	profile.Name = util.PickOrDefault(profile.Name, oldProfile.Name)
	profile.Email = util.PickOrDefault(profile.Email, oldProfile.Email)
	profile.Github = util.PickOrDefault(profile.Github, oldProfile.Github)
	profile.Linkedin = util.PickOrDefault(profile.Linkedin, oldProfile.Linkedin)
	profile.Bio = util.PickOrDefault(profile.Bio, oldProfile.Bio)

	updatedProfile, err := profile_repo.Update(&profile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PostUpdateProfileInfo() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedProfile)
}
