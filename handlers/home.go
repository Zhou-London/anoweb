package handlers

import (
	"net/http"

	"anonchihaya.co.uk/models"
	"anonchihaya.co.uk/repositories"
	"anonchihaya.co.uk/util"
	"github.com/gin-gonic/gin"
)

var img_path string = "/var/www/img"

func GetHomeMsg(c *gin.Context) {
	msg := "This is my personal website."

	c.JSON(200, gin.H{
		"message": msg,
	})
}

func PostProfileImg(c *gin.Context) {
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

	c.String(http.StatusOK, "upload success: %s", dst)
}

func GetProfileInfo(c *gin.Context, profile_repo repositories.ProfileRepository) {
	profile, err := profile_repo.GetByID(1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetProfileInfo() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

func DeleteProfileInfo(c *gin.Context, profile_repo repositories.ProfileRepository) {
	err := profile_repo.Delete(1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetDeletePRofileInfo() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile info deleted successfully"})
}

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

	profile := models.Profile{
		ID:       1,
		Name:     c.PostForm("name"),
		Email:    c.PostForm("email"),
		Github:   c.PostForm("github"),
		Linkedin: c.PostForm("linkedin"),
		Bio:      c.PostForm("bio"),
	}

	createErr := profile_repo.Create(&profile)
	if createErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PostCreateProfileInfo() error": createErr.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

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

	profile := models.Profile{
		ID:       1,
		Name:     util.PickOrDefault(c.PostForm("name"), oldProfile.Name),
		Email:    util.PickOrDefault(c.PostForm("email"), oldProfile.Email),
		Github:   util.PickOrDefault(c.PostForm("github"), oldProfile.Github),
		Linkedin: util.PickOrDefault(c.PostForm("linkedin"), oldProfile.Linkedin),
		Bio:      util.PickOrDefault(c.PostForm("bio"), oldProfile.Bio),
	}

	updatedProfile, err := profile_repo.Update(&profile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PostUpdateProfileInfo() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedProfile)
}
