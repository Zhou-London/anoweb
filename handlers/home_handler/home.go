package homehandler

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/models"
	"anonchihaya.co.uk/repositories"
	"anonchihaya.co.uk/util"
	"github.com/gin-gonic/gin"
)

func GetHomeMsg(c *gin.Context) {
	msg := "This is my personal website."

	c.JSON(200, gin.H{
		"message": msg,
	})
}

// * Profile
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

// * Experience
func GetExperiencesShort(c *gin.Context, experience_repo repositories.ExperienceRepository) {
	experiences, err := experience_repo.GetAllShort()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetExperiencesShort() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, experiences)
}

func PutExperienceOrder(c *gin.Context, experience_repo repositories.ExperienceRepository) {

	type PutExperienceOrderRequest struct {
		ID         int `json:"id"`
		OrderIndex int `json:"order_index"`
	}

	var req []PutExperienceOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, r := range req {
		_, err := experience_repo.UpdateOrderIndex(r.ID, r.OrderIndex)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"PutExperienceOrder() error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Experience order updated successfully"})
}

// * Education
func UploadEducationImg(c *gin.Context, img_path string, img_url_prefix string) {
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
	var education models.Education
	if err := c.ShouldBind(&education); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"PostEducation() error 1": err.Error()})
		return
	}

	id, err := education_repo.Create(&education)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PostEducation() error 2": err.Error()})
		return
	}

	education.ID = id
	c.JSON(http.StatusCreated, education)
}

func PostEducationImg(c *gin.Context, education_repo repositories.EducationRepository) {
	type PostEducationImgRequest struct {
		ID       int    `json:"id"`
		ImageURL string `json:"image_url"`
	}

	var req PostEducationImgRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"PostEducationImg() error": err.Error()})
		return
	}

	education, err := education_repo.UpdateImageUrl(req.ID, req.ImageURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PostEducationImg() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, education)
}

func PutEducation(c *gin.Context, education_repo repositories.EducationRepository) {

	var education models.Education

	if err := c.ShouldBind(&education); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"PutEducation() error": err.Error()})
		return
	}

	oldEducation, err := education_repo.GetByID(education.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"PutEducation() error": err.Error()})
		return
	}

	if oldEducation == nil {
		c.JSON(http.StatusBadRequest, gin.H{"PutEducation() error": "Education does not exist"})
		return
	}

	education.School = util.PickOrDefault(education.School, oldEducation.School)
	education.Degree = util.PickOrDefault(education.Degree, oldEducation.Degree)
	education.StartDate = util.PickOrDefault(education.StartDate, oldEducation.StartDate)
	education.EndDate = util.PickOrDefault(education.EndDate, oldEducation.EndDate)
	education.ImageURL = util.PickOrDefault(education.ImageURL, oldEducation.ImageURL)
	education.Link = util.PickOrDefault(education.Link, oldEducation.Link)

	updatedEducation, err := education_repo.Update(education.ID, &education)
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
