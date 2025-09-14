package homehandler

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/models"
	"anonchihaya.co.uk/repositories"
	"anonchihaya.co.uk/util"
	"github.com/gin-gonic/gin"
)

var img_path string = "/var/www/img"
var img_url_prefix string = "/image"

func GetHomeMsg(c *gin.Context) {
	msg := "This is my personal website."

	c.JSON(200, gin.H{
		"message": msg,
	})
}

// * Profile
func UploadProfileImg(c *gin.Context) {
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

// * Experience
func GetExperiencesShort(c *gin.Context, experience_repo repositories.ExperienceRepository) {
	experiences, err := experience_repo.GetAllShort()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetExperiencesShort() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, experiences)
}

// * Education
func UploadEducationImg(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.String(http.StatusBadRequest, "file not found")
		return
	}

	dst := img_path + "/education-img-" + file.Filename
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.String(http.StatusInternalServerError, "save failed: %s", err)
		return
	}

	c.String(http.StatusOK, img_url_prefix+"/education-img-"+file.Filename)
}

func GetEducations(c *gin.Context, education_repo repositories.EducationRepository) {
	educations, err := education_repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetEducations() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, educations)
}

func PostEducation(c *gin.Context, education_repo repositories.EducationRepository) {
	education := models.Education{
		School:    c.PostForm("school"),
		Degree:    c.PostForm("degree"),
		StartDate: c.PostForm("start_date"),
		EndDate:   c.PostForm("end_date"),
		Link:      c.PostForm("link"),
		ImageURL:  c.PostForm("image_url"),
	}

	id, err := education_repo.Create(&education)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PostEducation() error 2": err.Error()})
		return
	}

	education.ID = id
	c.JSON(http.StatusCreated, education)
}

func PutEducation(c *gin.Context, education_repo repositories.EducationRepository) {

	id := c.PostForm("id")
	educationID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"PutEducation() error": "Invalid education ID"})
		return
	}

	oldEducation, err := education_repo.GetByID(educationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PutEducation() error": err.Error()})
		return
	}

	newEducation := models.Education{
		ID:        oldEducation.ID,
		School:    util.PickOrDefault(c.PostForm("school"), oldEducation.School),
		Degree:    util.PickOrDefault(c.PostForm("degree"), oldEducation.Degree),
		StartDate: util.PickOrDefault(c.PostForm("start_date"), oldEducation.StartDate),
		EndDate:   util.PickOrDefault(c.PostForm("end_date"), oldEducation.EndDate),
		Link:      util.PickOrDefault(c.PostForm("link"), oldEducation.Link),
		ImageURL:  util.PickOrDefault(c.PostForm("image_url"), oldEducation.ImageURL),
	}

	updatedEducation, err := education_repo.Update(newEducation.ID, &newEducation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PutEducation() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedEducation)
}

func DeleteEducation(c *gin.Context, education_repo repositories.EducationRepository) {
	id := c.Param("id")
	educationID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid education ID"})
		return
	}

	err = education_repo.Delete(educationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"DeleteEducation() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Education deleted successfully"})
}
