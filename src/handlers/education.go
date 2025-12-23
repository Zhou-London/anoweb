package handlers

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"anonchihaya.co.uk/src/util"
	"github.com/gin-gonic/gin"
)

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
